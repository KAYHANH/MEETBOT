import { Meeting } from '../models/Meeting.js';
import { UserSettings } from '../models/UserSettings.js';
import { ActivityLog } from '../models/ActivityLog.js';
import * as googleService from './googleService.js';
import * as emailTemplates from '../utils/emailTemplates.js';
import { logger } from '../utils/logger.js';

const ATTENDANCE_LOOKBACK_MS = 12 * 60 * 60 * 1000;
const ATTENDANCE_LOOKAHEAD_MS = 18 * 60 * 60 * 1000;

const extractMeetingCode = (meetLink = '') => {
  if (!meetLink) return null;

  try {
    const { pathname } = new URL(meetLink);
    const candidate = pathname.split('/').filter(Boolean).pop();
    return /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(candidate || '') ? candidate : null;
  } catch {
    return null;
  }
};

const getParticipantIdentity = (participant) => {
  if (participant.signedinUser) {
    return {
      participantName: participant.signedinUser.displayName || 'Signed-in participant',
      participantType: 'signed_in',
      participantUser: participant.signedinUser.user || null,
    };
  }

  if (participant.anonymousUser) {
    return {
      participantName: participant.anonymousUser.displayName || 'Anonymous participant',
      participantType: 'anonymous',
      participantUser: null,
    };
  }

  return {
    participantName: participant.phoneUser?.displayName || 'Phone participant',
    participantType: 'phone',
    participantUser: null,
  };
};

const getDurationMinutes = (startTime, endTime = null) => {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 60000));
};

const buildAttendanceParticipants = async (userId, participants) => {
  const attendance = [];

  for (const participant of participants) {
    const participantSessions = await googleService.listParticipantSessions(userId, participant.name);
    const sessions = participantSessions
      .map((session) => ({
        sessionName: session.name,
        startTime: session.startTime ? new Date(session.startTime) : null,
        endTime: session.endTime ? new Date(session.endTime) : null,
        durationMinutes: getDurationMinutes(session.startTime, session.endTime),
      }))
      .filter((session) => session.startTime)
      .sort((left, right) => left.startTime - right.startTime);

    const identity = getParticipantIdentity(participant);

    attendance.push({
      ...identity,
      participantResourceName: participant.name,
      earliestStartTime: participant.earliestStartTime ? new Date(participant.earliestStartTime) : sessions[0]?.startTime || null,
      latestEndTime: participant.latestEndTime ? new Date(participant.latestEndTime) : sessions.at(-1)?.endTime || null,
      totalDurationMinutes: sessions.reduce((total, session) => total + session.durationMinutes, 0),
      sessions,
    });
  }

  return attendance.sort((left, right) => {
    const leftTime = left.earliestStartTime ? new Date(left.earliestStartTime).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.earliestStartTime ? new Date(right.earliestStartTime).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });
};

const selectConferenceRecord = (meeting, conferenceRecords) => {
  if (!conferenceRecords.length) return null;

  if (meeting.conferenceRecordName) {
    const existing = conferenceRecords.find((record) => record.name === meeting.conferenceRecordName);
    if (existing) return existing;
  }

  const scheduledTime = new Date(meeting.scheduledAt).getTime();

  return [...conferenceRecords].sort((left, right) => {
    const leftActive = !left.endTime ? -1 : 0;
    const rightActive = !right.endTime ? -1 : 0;
    if (leftActive !== rightActive) return leftActive - rightActive;

    const leftDiff = Math.abs(new Date(left.startTime).getTime() - scheduledTime);
    const rightDiff = Math.abs(new Date(right.startTime).getTime() - scheduledTime);
    return leftDiff - rightDiff;
  })[0];
};

const flattenAttendanceSessions = (attendanceParticipants = []) =>
  attendanceParticipants.flatMap((participant) =>
    (participant.sessions || []).map((session) => ({
      sessionName: session.sessionName,
      participantName: participant.participantName,
      startTime: session.startTime ? new Date(session.startTime).toISOString() : null,
      endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
      durationMinutes: session.durationMinutes || 0,
    })),
  );

export const scheduleMeeting = async (data) => {
  const { userId, userEmail, recipientName, recipientEmail, subject, message, scheduledAt, timezone, durationMinutes } = data;

  const settings = await UserSettings.findOne({ userId });
  const reminderMinutes = settings?.emailReminderMinutes || [1440, 60];

  const reminders = reminderMinutes.map(mins => ({
    type: 'email',
    minutesBefore: mins,
    sent: false
  }));
  
  // Always add "starting now" reminder
  reminders.push({ type: 'email_now', minutesBefore: 0, sent: false });

  const meeting = new Meeting({
    userId,
    userEmail,
    recipientName,
    recipientEmail,
    subject,
    message,
    scheduledAt: new Date(scheduledAt),
    timezone,
    durationMinutes,
    reminders,
    status: 'scheduled'
  });

  try {
    // 1. Create Calendar Event
    const endTime = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60000).toISOString();
    const calendarResult = await googleService.createCalendarEvent({
      userId,
      summary: subject,
      description: message,
      startTime: new Date(scheduledAt).toISOString(),
      endTime,
      attendees: [recipientEmail],
      timezone
    });

    meeting.googleCalendarEventId = calendarResult.eventId;
    meeting.googleMeetLink = calendarResult.meetLink;
    meeting.googleMeetCode = extractMeetingCode(calendarResult.meetLink);
    
    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'calendar_created',
      message: `Calendar event created with Meet link: ${calendarResult.meetLink}`
    });

    // 2. Send Invitation Email
    const inviteHtml = emailTemplates.meetingInvite({
      senderName: userEmail.split('@')[0], // Fallback name
      senderEmail: userEmail,
      recipientName,
      subject,
      message,
      scheduledAt,
      durationMinutes,
      meetLink: calendarResult.meetLink,
      timezone
    });

    const messageId = await googleService.sendEmail({
      userId,
      to: recipientEmail,
      subject: `Meeting Invitation: ${subject}`,
      htmlBody: inviteHtml
    });

    meeting.emailMessageId = messageId;
    meeting.status = 'email_sent';

    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'email_sent',
      message: `Invitation email sent to ${recipientEmail}`
    });

  } catch (error) {
    meeting.status = 'failed';
    logger.error('Error in scheduleMeeting pipeline:', error);
    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'error',
      message: 'Failed to complete meeting setup pipeline',
      error: error.message
    });

    await meeting.save();

    const wrappedError = new Error(`Meeting scheduling failed: ${error.message}`);
    wrappedError.status = error.status || 502;
    throw wrappedError;
  }

  await meeting.save();
  return meeting;
};

export const syncMeetingAttendance = async (meetingId, userId) => {
  const meeting = await Meeting.findOne({ _id: meetingId, userId });
  if (!meeting || !meeting.googleMeetLink) return null;

  const meetingCode = meeting.googleMeetCode || extractMeetingCode(meeting.googleMeetLink);
  if (!meetingCode) return meeting;

  try {
    const filterStart = new Date(new Date(meeting.scheduledAt).getTime() - ATTENDANCE_LOOKBACK_MS);
    const filterEnd = new Date(
      new Date(meeting.scheduledAt).getTime() + meeting.durationMinutes * 60000 + ATTENDANCE_LOOKAHEAD_MS,
    );

    const conferenceRecords = await googleService.listConferenceRecords({
      userId,
      meetingCode,
      startTime: filterStart,
      endTime: filterEnd,
    });

    const conferenceRecord = selectConferenceRecord(meeting, conferenceRecords);
    if (!conferenceRecord) return meeting;

    const participants = await googleService.listConferenceParticipants(userId, conferenceRecord.name);
    const attendanceParticipants = await buildAttendanceParticipants(userId, participants);

    const previousSessions = new Map(
      flattenAttendanceSessions(meeting.attendanceParticipants).map((session) => [session.sessionName, session]),
    );
    const nextSessions = new Map(
      flattenAttendanceSessions(attendanceParticipants).map((session) => [session.sessionName, session]),
    );

    meeting.googleMeetCode = meetingCode;
    meeting.conferenceRecordName = conferenceRecord.name;
    meeting.actualStartedAt = conferenceRecord.startTime ? new Date(conferenceRecord.startTime) : meeting.actualStartedAt;
    meeting.actualEndedAt = conferenceRecord.endTime ? new Date(conferenceRecord.endTime) : meeting.actualEndedAt;
    meeting.attendanceLastSyncedAt = new Date();
    meeting.attendanceParticipants = attendanceParticipants;

    if (conferenceRecord.endTime && !['cancelled', 'failed'].includes(meeting.status)) {
      meeting.status = 'completed';
    }

    const newJoinLogs = [];
    const leaveLogs = [];

    for (const [sessionName, session] of nextSessions.entries()) {
      if (!previousSessions.has(sessionName)) {
        newJoinLogs.push({
          userId,
          meetingId: meeting._id,
          type: 'participant_joined',
          message: `${session.participantName} joined "${meeting.subject}"`,
          createdAt: session.startTime || new Date(),
        });
      }
    }

    for (const [sessionName, previous] of previousSessions.entries()) {
      const current = nextSessions.get(sessionName);
      if (current && !previous.endTime && current.endTime) {
        leaveLogs.push({
          userId,
          meetingId: meeting._id,
          type: 'participant_left',
          message: `${current.participantName} left "${meeting.subject}" after ${current.durationMinutes} minute${current.durationMinutes === 1 ? '' : 's'}`,
          createdAt: current.endTime,
        });
      }
    }

    await meeting.save();

    if (newJoinLogs.length > 0) {
      await ActivityLog.insertMany(newJoinLogs, { ordered: false });
    }

    if (leaveLogs.length > 0) {
      await ActivityLog.insertMany(leaveLogs, { ordered: false });
    }

    return meeting;
  } catch (error) {
    const status = error.response?.status || error.code || error.status;
    const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message;

    if (status === 403 || status === 401) {
      logger.warn(`Attendance sync skipped for meeting ${meeting._id}: ${errorMessage}`);
      return meeting;
    }

    logger.error(`Failed to sync attendance for meeting ${meeting._id}:`, error);
    return meeting;
  }
};

export const sendReminder = async (meeting, reminderIndex) => {
  const reminder = meeting.reminders[reminderIndex];
  const { userId, recipientEmail, userEmail, recipientName, subject, scheduledAt, timezone, googleMeetLink } = meeting;

  try {
    if (reminder.type === 'email_now') {
      // Send to recipient
      const nowHtmlRecipient = emailTemplates.meetingNow({
        recipientName,
        subject,
        meetLink: googleMeetLink,
        scheduledAt,
        timezone,
        isOrganizer: false
      });
      await googleService.sendEmail({ userId, to: recipientEmail, subject: `Starting Now: ${subject}`, htmlBody: nowHtmlRecipient });

      // Send to organizer
      const nowHtmlOrganizer = emailTemplates.meetingNow({
        recipientName: 'You',
        subject,
        meetLink: googleMeetLink,
        scheduledAt,
        timezone,
        isOrganizer: true
      });
      await googleService.sendEmail({ userId, to: userEmail, subject: `Starting Now: ${subject}`, htmlBody: nowHtmlOrganizer });

      meeting.status = 'completed';
    } else {
      const reminderHtml = emailTemplates.reminder({
        recipientName,
        subject,
        scheduledAt,
        minutesBefore: reminder.minutesBefore,
        meetLink: googleMeetLink,
        timezone
      });
      await googleService.sendEmail({ userId, to: recipientEmail, subject: `Reminder: ${subject}`, htmlBody: reminderHtml });
      
      if (meeting.status === 'email_sent') {
        meeting.status = 'reminders_sent';
      }
    }

    reminder.sent = true;
    reminder.sentAt = new Date();
    
    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'reminder_sent',
      message: `Reminder (${reminder.minutesBefore}m) sent to ${recipientEmail}`
    });

  } catch (error) {
    logger.error(`Failed to send reminder for meeting ${meeting._id}:`, error);
    reminder.error = error.message;
    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'error',
      message: `Failed to send reminder (${reminder.minutesBefore}m)`,
      error: error.message
    });
  }

  await meeting.save();
};

export const cancelMeeting = async (meetingId, userId, reason) => {
  const meeting = await Meeting.findOne({ _id: meetingId, userId });
  if (!meeting) throw new Error('Meeting not found');

  meeting.status = 'cancelled';
  meeting.cancelledAt = new Date();
  meeting.cancelReason = reason;

  try {
    if (meeting.googleCalendarEventId) {
      await googleService.deleteCalendarEvent(userId, meeting.googleCalendarEventId);
    }

    const cancelHtml = emailTemplates.cancellation({
      recipientName: meeting.recipientName,
      subject: meeting.subject,
      reason
    });

    await googleService.sendEmail({
      userId,
      to: meeting.recipientEmail,
      subject: `Cancelled: ${meeting.subject}`,
      htmlBody: cancelHtml
    });

    await ActivityLog.create({
      userId,
      meetingId: meeting._id,
      type: 'meeting_cancelled',
      message: `Meeting cancelled. Reason: ${reason || 'Not specified'}`
    });

  } catch (error) {
    logger.error(`Error during cancellation for meeting ${meetingId}:`, error);
  }

  await meeting.save();
  return meeting;
};

export const resendInvite = async (meetingId, userId) => {
  const meeting = await Meeting.findOne({ _id: meetingId, userId });
  if (!meeting) throw new Error('Meeting not found');

  const inviteHtml = emailTemplates.meetingInvite({
    senderName: meeting.userEmail.split('@')[0],
    senderEmail: meeting.userEmail,
    recipientName: meeting.recipientName,
    subject: meeting.subject,
    message: meeting.message,
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    meetLink: meeting.googleMeetLink,
    timezone: meeting.timezone,
    isResend: true
  });

  await googleService.sendEmail({
    userId,
    to: meeting.recipientEmail,
    subject: `[Resent] Meeting Invitation: ${meeting.subject}`,
    htmlBody: inviteHtml
  });

  await ActivityLog.create({
    userId,
    meetingId: meeting._id,
    type: 'email_sent',
    message: `Invitation resent to ${meeting.recipientEmail}`
  });

  return { message: 'Invite resent successfully' };
};
