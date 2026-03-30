import { Meeting } from '../models/Meeting.js';
import { UserSettings } from '../models/UserSettings.js';
import { ActivityLog } from '../models/ActivityLog.js';
import * as googleService from './googleService.js';
import * as emailTemplates from '../utils/emailTemplates.js';
import { logger } from '../utils/logger.js';

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
