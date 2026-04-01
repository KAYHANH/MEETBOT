import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Link2,
  Mail,
  RotateCcw,
  UserRound,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { AvatarStack, Badge, Button, C, Card, Spinner } from '../ui';

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateStr));

const formatDuration = (minutes) => {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${rest ? ` ${rest}m` : ''}`;
};

const formatTime = (dateStr) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateStr));

const reminderLabel = (reminder) => {
  if (reminder.type === 'email_now' || reminder.minutesBefore === 0) return 'Starting now alert';
  if (reminder.minutesBefore >= 60) return `${reminder.minutesBefore / 60}h reminder`;
  return `${reminder.minutesBefore}m reminder`;
};

const getParticipants = (meeting) => {
  if (Array.isArray(meeting.participants) && meeting.participants.length > 0) {
    return meeting.participants;
  }
  return [meeting.recipientName, 'Ops Team', 'Host'];
};

const getAttendanceParticipants = (meeting) =>
  Array.isArray(meeting.attendanceParticipants) ? meeting.attendanceParticipants : [];

export const MeetingCard = ({ meeting, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const attendanceParticipants = useMemo(() => getAttendanceParticipants(meeting), [meeting]);
  const participants = useMemo(() => {
    if (attendanceParticipants.length > 0) {
      return attendanceParticipants.map((participant) => participant.participantName);
    }
    return getParticipants(meeting);
  }, [attendanceParticipants, meeting]);
  const sentReminders = meeting.reminders.filter((reminder) => reminder.sent).length;
  const attendanceCount = attendanceParticipants.length;
  const attendanceDuration = attendanceParticipants.reduce(
    (total, participant) => total + (participant.totalDurationMinutes || 0),
    0,
  );

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;

    setLoading(true);
    try {
      await api.cancelMeeting(meeting._id, reason);
      onRefresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.resendInvite(meeting._id);
      alert('Invitation resent successfully.');
      onRefresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="0" style={{ overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: '22px 24px',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '260px', flex: '1 1 320px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: C.surfaceSoft,
                color: C.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserRound size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '19px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {meeting.subject}
              </div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', color: C.textMuted, fontSize: '13px' }}>
                <span>Meeting ID: {meeting._id.replace('demo-meeting-', 'MB-')}</span>
                <span style={{ color: C.hairline }}>•</span>
                <span>{meeting.recipientEmail}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: '0 0 160px' }}>
            <Badge status={meeting.status} />
          </div>

          <div style={{ color: C.textMuted, fontSize: '14px', lineHeight: '1.6', flex: '1 1 190px' }}>
            <div style={{ fontWeight: 700, color: C.text }}>{formatDate(meeting.scheduledAt)}</div>
            <div>{formatDuration(meeting.durationMinutes)}</div>
          </div>

          <AvatarStack items={participants} style={{ flex: '0 0 140px' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', color: C.textDim, marginLeft: 'auto' }}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: '0 24px 24px',
            borderTop: `1px solid ${C.ghostBorder}`,
            background: 'linear-gradient(180deg, rgba(243,246,249,0.65) 0%, rgba(255,255,255,0.9) 100%)',
          }}
        >
          <div className="dual-grid" style={{ marginTop: '22px' }}>
            <div>
              <div style={{ display: 'grid', gap: '14px' }}>
                {[
                  {
                    icon: <UserRound size={16} />,
                    label: 'Lead attendee',
                    value: `${meeting.recipientName} · ${meeting.recipientEmail}`,
                  },
                  {
                    icon: <CalendarDays size={16} />,
                    label: 'Scheduled for',
                    value: formatDate(meeting.scheduledAt),
                  },
                  {
                    icon: <Clock3 size={16} />,
                    label: 'Duration & timezone',
                    value: `${formatDuration(meeting.durationMinutes)} · ${meeting.timezone}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '14px 16px',
                      borderRadius: '18px',
                      background: C.surface,
                      boxShadow: `inset 0 0 0 1px ${C.ghostBorder}`,
                    }}
                  >
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '12px',
                        background: C.surfaceSoft,
                        color: C.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: C.textDim, textTransform: 'uppercase' }}>
                        {item.label}
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '14px', color: C.textMuted, lineHeight: '1.6' }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {meeting.googleMeetLink && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px 18px',
                    borderRadius: '18px',
                    background: C.accentTint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: C.accent, textTransform: 'uppercase' }}>
                      Google Meet Link
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 700, color: C.text }}>
                      {meeting.googleMeetLink}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    small
                    leading={<ExternalLink size={14} />}
                    onClick={() => window.open(meeting.googleMeetLink, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              )}

              <div
                style={{
                  marginTop: '16px',
                  padding: '18px',
                  borderRadius: '20px',
                  background: C.surface,
                  boxShadow: `inset 0 0 0 1px ${C.ghostBorder}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: C.textDim, textTransform: 'uppercase' }}>
                      Meet attendance
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 800 }}>
                      {attendanceCount > 0 ? `${attendanceCount} joined` : 'Waiting for first join'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '13px', color: C.textMuted }}>
                    <div>
                      {meeting.actualStartedAt ? `Started ${formatTime(meeting.actualStartedAt)}` : 'Starts when the first person joins'}
                    </div>
                    <div>
                      {meeting.actualEndedAt
                        ? `Ended ${formatTime(meeting.actualEndedAt)}`
                        : meeting.attendanceLastSyncedAt
                          ? `Synced ${formatTime(meeting.attendanceLastSyncedAt)}`
                          : 'Not synced yet'}
                    </div>
                  </div>
                </div>

                {attendanceCount > 0 ? (
                  <>
                    <div style={{ marginTop: '16px', fontSize: '13px', color: C.textDim }}>
                      Total attendee time tracked: {formatDuration(attendanceDuration)}
                    </div>

                    <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                      {attendanceParticipants.map((participant) => (
                        <div
                          key={participant.participantResourceName}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '18px',
                            background: C.surfaceSoft,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800 }}>{participant.participantName}</div>
                              <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim, textTransform: 'capitalize' }}>
                                {participant.participantType.replace('_', ' ')}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: C.text }}>
                                {formatDuration(participant.totalDurationMinutes)}
                              </div>
                              <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim }}>
                                {participant.earliestStartTime ? formatTime(participant.earliestStartTime) : '--'} -{' '}
                                {participant.latestEndTime ? formatTime(participant.latestEndTime) : 'Live'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                            {participant.sessions.map((session) => (
                              <div
                                key={session.sessionName}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  padding: '10px 12px',
                                  borderRadius: '14px',
                                  background: C.surface,
                                }}
                              >
                                <div style={{ fontSize: '13px', color: C.textMuted }}>
                                  {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'Live'}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>
                                  {formatDuration(session.durationMinutes)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.7', color: C.textMuted }}>
                    Join events appear automatically after participants enter the Google Meet link that MeetBot sent in the invitation email.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  padding: '18px',
                  borderRadius: '20px',
                  background: C.surface,
                  boxShadow: `inset 0 0 0 1px ${C.ghostBorder}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: C.textDim, textTransform: 'uppercase' }}>
                      Reminder timeline
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 800 }}>
                      {sentReminders}/{meeting.reminders.length} completed
                    </div>
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      background: C.surfaceSoft,
                      color: C.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mail size={18} />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
                  {meeting.reminders.map((reminder, index) => (
                    <div
                      key={`${meeting._id}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: reminder.sent ? C.successTint : C.surfaceSoft,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: reminder.sent ? C.success : C.textDim,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{reminderLabel(reminder)}</div>
                          <div style={{ marginTop: '3px', fontSize: '12px', color: C.textDim }}>
                            {reminder.sent && reminder.sentAt
                              ? `Sent ${formatDate(reminder.sentAt)}`
                              : 'Pending'}
                          </div>
                        </div>
                      </div>
                      {reminder.type === 'email_now' ? <Link2 size={16} color={C.accent} /> : <Clock3 size={16} color={C.textDim} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            {loading ? (
              <Spinner size={24} />
            ) : (
              <>
                <Button small variant="secondary" leading={<RotateCcw size={14} />} onClick={handleResend}>
                  Resend Invite
                </Button>
                {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                  <Button small variant="danger" leading={<XCircle size={14} />} onClick={handleCancel}>
                    Cancel Meeting
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
