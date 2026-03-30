import React, { useState } from 'react';
import { api } from '../../services/api';
import { Badge, Button, C, Card, Spinner } from '../ui';

export const MeetingCard = ({ meeting, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  const handleCancel = async () => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    
    setLoading(true);
    try {
      await api.cancelMeeting(meeting._id, reason);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.resendInvite(meeting._id);
      alert('Invitation resent successfully!');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sentReminders = meeting.reminders.filter(r => r.sent).length;
  const totalReminders = meeting.reminders.length;

  return (
    <Card style={{ padding: '16px', marginBottom: '12px', cursor: 'pointer' }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
      >
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: `${C.accent}22`, 
          color: C.accent, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '800',
          flexShrink: 0
        }}>
          {meeting.recipientName.charAt(0).toUpperCase()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meeting.subject}</span>
            <Badge status={meeting.status} />
          </div>
          <div style={{ fontSize: '12px', color: C.textMuted }}>
            {formatDate(meeting.scheduledAt)} &bull; {meeting.recipientName}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: C.textDim, textTransform: 'uppercase', marginBottom: '4px' }}>Reminders</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>{sentReminders}/{totalReminders}</div>
        </div>

        <div style={{ fontSize: '18px', color: C.textDim, marginLeft: '8px' }}>
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: C.textDim, textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Recipient</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{meeting.recipientName}</div>
              <div style={{ fontSize: '13px', color: C.textMuted }}>{meeting.recipientEmail}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: C.textDim, textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Schedule</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{new Date(meeting.scheduledAt).toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: C.textMuted }}>{meeting.durationMinutes} mins &bull; {meeting.timezone}</div>
            </div>
          </div>

          {meeting.googleMeetLink && (
            <div style={{ 
              background: `${C.info}11`, 
              padding: '16px', 
              borderRadius: '8px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: C.info, fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Google Meet Link</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{meeting.googleMeetLink}</div>
              </div>
              <Button small onClick={() => window.open(meeting.googleMeetLink, '_blank')}>Join</Button>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: C.textDim, textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>Reminders Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {meeting.reminders.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                  <span style={{ color: r.sent ? C.success : C.textDim }}>{r.sent ? '✓' : '○'}</span>
                  <span style={{ flex: 1 }}>{r.type === 'email_now' ? '🔔 Starting Now Alert' : `⏰ ${r.minutesBefore / 60}h Reminder`}</span>
                  <span style={{ color: C.textDim, fontSize: '11px' }}>{r.sent ? new Date(r.sentAt).toLocaleTimeString() : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {loading ? <Spinner /> : (
              <>
                <Button small variant="secondary" onClick={handleResend}>✉ Resend Invite</Button>
                {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                  <Button small variant="danger" onClick={handleCancel}>Cancel Meeting</Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
