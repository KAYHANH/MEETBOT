import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { Card, Input, Textarea, Select, Button, C } from '../ui';

export const MeetingComposer = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    subject: '',
    message: '',
    scheduledAt: '',
    durationMinutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const { execute: createMeeting, loading, error: submitError } = useApi(api.createMeeting.bind(api));

  const validate = () => {
    const newErrors = {};
    if (!formData.recipientName) newErrors.recipientName = 'Name is required';
    if (!formData.recipientEmail) newErrors.recipientEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) newErrors.recipientEmail = 'Invalid email';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';
    if (!formData.scheduledAt) newErrors.scheduledAt = 'Date and time are required';
    else if (new Date(formData.scheduledAt) < new Date(Date.now() + 5 * 60000)) {
      newErrors.scheduledAt = 'Must be at least 5 minutes in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createMeeting({
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString()
      });
      setSuccess(result);
    } catch (err) {
      // Error handled by useApi
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: `${C.success}22`, 
          color: C.success, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '40px',
          margin: '0 auto 24px'
        }}>✓</div>
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>Meeting Scheduled!</h2>
        <p style={{ color: C.textMuted, marginBottom: '32px' }}>
          We've sent the invitation to <strong>{success.recipientEmail}</strong> and added the event to your calendar.
        </p>

        <Card style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: C.textDim, textTransform: 'uppercase', fontWeight: '700' }}>Google Meet Link</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: C.info }}>{success.googleMeetLink || 'Generating...'}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={() => setSuccess(null)} variant="secondary" style={{ flex: 1 }}>Schedule Another</Button>
            <Button onClick={() => window.location.href = '/meetings'} style={{ flex: 1 }}>View All Meetings</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>New Meeting</h1>
        <p style={{ color: C.textMuted, margin: 0 }}>Compose your invitation and let MeetBot handle the rest.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="1. Recipient Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Input 
              label="Recipient Name" 
              placeholder="e.g. John Doe" 
              value={formData.recipientName}
              onChange={e => setFormData({...formData, recipientName: e.target.value})}
              error={errors.recipientName}
            />
            <Input 
              label="Recipient Email" 
              placeholder="e.g. john@example.com" 
              value={formData.recipientEmail}
              onChange={e => setFormData({...formData, recipientEmail: e.target.value})}
              error={errors.recipientEmail}
            />
          </div>
        </Card>

        <Card title="2. Invitation Message">
          <Input 
            label="Subject" 
            placeholder="e.g. Project Sync-up" 
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
            error={errors.subject}
          />
          <Textarea 
            label="Message" 
            placeholder="Write a brief message for the invitation..." 
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            error={errors.message}
          />
        </Card>

        <Card title="3. Scheduling">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <Input 
              label="Date & Time" 
              type="datetime-local" 
              value={formData.scheduledAt}
              onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
              error={errors.scheduledAt}
            />
            <Select 
              label="Duration" 
              value={formData.durationMinutes}
              onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </Select>
            <Input 
              label="Timezone" 
              value={formData.timezone}
              onChange={e => setFormData({...formData, timezone: e.target.value})}
            />
          </div>
        </Card>

        <div style={{ 
          background: `${C.info}11`, 
          border: `1px solid ${C.info}33`, 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px',
          display: 'flex',
          gap: '16px'
        }}>
          <div style={{ fontSize: '24px' }}>ℹ️</div>
          <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: '1.5' }}>
            <strong style={{ color: C.text }}>What happens next?</strong><br />
            Once you click schedule, MeetBot will automatically:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Send a professional HTML invitation via your Gmail.</li>
              <li>Create a Google Calendar event with a Meet video link.</li>
              <li>Schedule automated email reminders (24h and 1h before).</li>
              <li>Send a "Starting Now" alert with the join link at meeting time.</li>
            </ul>
          </div>
        </div>

        {submitError && (
          <div style={{
            background: `${C.danger}11`,
            border: `1px solid ${C.danger}33`,
            color: C.danger,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            {submitError}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" loading={loading} style={{ padding: '12px 40px', fontSize: '16px' }}>
            Schedule Meeting
          </Button>
        </div>
      </form>
    </div>
  );
};
