import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  Mail,
  Sparkles,
  Users,
  Video,
  WandSparkles,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import {
  Button,
  C,
  Card,
  Eyebrow,
  Input,
  Select,
  Textarea,
  Toggle,
} from '../ui';

const formatDateInput = (date) => date.toISOString().slice(0, 10);
const formatTimeInput = (date) => date.toTimeString().slice(0, 5);

const getDefaultDateTime = () => {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(9, 0, 0, 0);
  return value;
};

const buildIsoDate = (date, time) => {
  if (!date || !time) return null;
  const localDate = new Date(`${date}T${time}`);
  return Number.isNaN(localDate.getTime()) ? null : localDate.toISOString();
};

export const MeetingComposer = () => {
  const navigate = useNavigate();
  const defaultDateTime = getDefaultDateTime();
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    collaboratorInput: '',
    collaborators: ['Product Team', 'ops@meetbot.app'],
    subject: 'Q4 Strategy Sync',
    message: '',
    scheduledDate: formatDateInput(defaultDateTime),
    scheduledTime: formatTimeInput(defaultDateTime),
    durationMinutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    includeMeetLink: true,
    enableTranscript: true,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const { data: settings, loading: loadingSettings } = useApi(api.getSettings.bind(api), true);
  const { execute: createMeeting, loading, error: submitError } = useApi(api.createMeeting.bind(api));

  useEffect(() => {
    if (!settings) return;
    setFormData((current) => ({
      ...current,
      durationMinutes: settings.defaultMeetingDuration || current.durationMinutes,
      timezone: settings.defaultTimezone || current.timezone,
    }));
  }, [settings]);

  const validate = () => {
    const nextErrors = {};
    if (!formData.recipientName.trim()) nextErrors.recipientName = 'Lead attendee name is required';
    if (!formData.recipientEmail.trim()) nextErrors.recipientEmail = 'Work email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) nextErrors.recipientEmail = 'Enter a valid email';
    if (!formData.subject.trim()) nextErrors.subject = 'Meeting title is required';
    if (!formData.scheduledDate) nextErrors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) nextErrors.scheduledTime = 'Start time is required';

    const scheduledAt = buildIsoDate(formData.scheduledDate, formData.scheduledTime);
    if (!scheduledAt) {
      nextErrors.scheduledDate = 'Select a valid date and time';
    } else if (new Date(scheduledAt) < new Date(Date.now() + 5 * 60 * 1000)) {
      nextErrors.scheduledDate = 'Meeting must be at least 5 minutes in the future';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const addCollaborator = () => {
    const value = formData.collaboratorInput.trim();
    if (!value || formData.collaborators.includes(value)) return;
    setFormData((current) => ({
      ...current,
      collaborators: [...current.collaborators, value],
      collaboratorInput: '',
    }));
  };

  const removeCollaborator = (value) => {
    setFormData((current) => ({
      ...current,
      collaborators: current.collaborators.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const scheduledAt = buildIsoDate(formData.scheduledDate, formData.scheduledTime);

    try {
      const result = await createMeeting({
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        subject: formData.subject,
        message: formData.message || `Agenda for ${formData.subject}.`,
        scheduledAt,
        durationMinutes: formData.durationMinutes,
        timezone: formData.timezone,
        collaborators: formData.collaborators,
      });
      setSuccess(result);
    } catch {
      // handled by hook
    }
  };

  const scheduledAt = useMemo(
    () => buildIsoDate(formData.scheduledDate, formData.scheduledTime),
    [formData.scheduledDate, formData.scheduledTime],
  );

  if (success) {
    return (
      <div className="page-grid">
        <div>
          <Eyebrow>Meeting created</Eyebrow>
          <h1 style={{ marginTop: '14px', fontSize: '48px', letterSpacing: '-0.05em' }}>Session scheduled</h1>
          <p style={{ marginTop: '10px', fontSize: '16px', lineHeight: '1.7', maxWidth: '620px' }}>
            MeetBot has queued the invitation, calendar event, and reminder timeline for{' '}
            <strong style={{ color: C.text }}>{success.recipientEmail}</strong>.
          </p>
        </div>

        <div className="composer-grid">
          <Card
            tone="dark"
            title="Session summary"
            subtitle={`${formData.scheduledDate} · ${formData.scheduledTime} · ${formData.collaborators.length + 1} participants`}
          >
            <div style={{ fontSize: '34px', fontWeight: 800, lineHeight: '1.1', marginTop: '6px' }}>
              {success.subject}
            </div>
            <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
              {[
                { label: 'Lead attendee', value: success.recipientName },
                { label: 'Timezone', value: success.timezone },
                { label: 'Meet link', value: success.googleMeetLink || 'Generating...' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>
                    {item.label}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Next actions">
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                'Invitation email prepared',
                'Calendar event created',
                'Reminder timeline queued',
                'Starting now alert armed',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: C.surfaceSoft,
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '12px',
                      background: C.successTint,
                      color: C.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarCheck2 size={16} />
                  </div>
                  <span style={{ fontWeight: 700 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
              <Button variant="secondary" onClick={() => setSuccess(null)}>
                Schedule another
              </Button>
              <Button onClick={() => navigate('/meetings')} trailing={<ChevronRight size={16} />}>
                View meetings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <div>
        <div style={{ fontSize: '13px', color: C.textDim }}>
          Pages <span style={{ margin: '0 8px' }}>›</span> <span style={{ color: C.accent, fontWeight: 700 }}>New Meeting</span>
        </div>
        <h1 style={{ marginTop: '14px', fontSize: '48px', letterSpacing: '-0.05em' }}>Create new meeting</h1>
        <p style={{ marginTop: '10px', maxWidth: '720px', fontSize: '16px', lineHeight: '1.7' }}>
          Configure your session details, invite participants, and set your automated
          workflow in one polished flow.
        </p>
        <div style={{ marginTop: '14px', fontSize: '13px', color: C.textDim }}>
          {loadingSettings
            ? 'Syncing your saved workspace defaults...'
            : settings
              ? `Defaults loaded for ${formData.timezone}.`
              : 'Using local defaults until workspace settings load.'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="composer-grid">
          <div className="page-grid">
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '12px',
                      background: C.accentTint,
                      color: C.accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Users size={16} />
                  </span>
                  Recipient details
                </span>
              }
            >
              <div className="dual-grid">
                <Input
                  label="Lead attendee name"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.recipientName}
                  onChange={(event) => setFormData({ ...formData, recipientName: event.target.value })}
                  error={errors.recipientName}
                />
                <Input
                  label="Work email"
                  placeholder="sarah@enterprise.com"
                  value={formData.recipientEmail}
                  onChange={(event) => setFormData({ ...formData, recipientEmail: event.target.value })}
                  error={errors.recipientEmail}
                />
              </div>

              <div style={{ marginTop: '18px' }}>
                <Input
                  label="Add collaborators"
                  placeholder="Invite via email or team name..."
                  value={formData.collaboratorInput}
                  onChange={(event) => setFormData({ ...formData, collaboratorInput: event.target.value })}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addCollaborator();
                    }
                  }}
                  hint="Press Enter to add multiple collaborators."
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {formData.collaborators.map((collaborator) => (
                    <span
                      key={collaborator}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '999px',
                        background: C.surfaceSoft,
                        color: C.textMuted,
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {collaborator}
                      <button
                        type="button"
                        onClick={() => removeCollaborator(collaborator)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          display: 'inline-flex',
                          color: C.textDim,
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '12px',
                      background: C.accentTint,
                      color: C.accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mail size={16} />
                  </span>
                  Invitation message
                </span>
              }
            >
              <Input
                label="Meeting title"
                placeholder="Q4 Strategy Sync: Enterprise Architecture Expansion"
                value={formData.subject}
                onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                error={errors.subject}
              />

              <div style={{ marginTop: '18px' }}>
                <Textarea
                  label="Custom note"
                  placeholder="Include context or specific goals for the meeting..."
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  error={errors.message}
                  hint="AI rewrite available once the real sending flow is connected."
                />
              </div>
            </Card>
          </div>

          <div className="page-grid">
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '12px',
                      background: C.accentTint,
                      color: C.accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarDays size={16} />
                  </span>
                  Scheduling
                </span>
              }
              style={{ background: C.surfaceSoft }}
            >
              <div className="page-grid" style={{ gap: '16px' }}>
                <Input
                  label="Date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(event) => setFormData({ ...formData, scheduledDate: event.target.value })}
                  error={errors.scheduledDate}
                />

                <div className="dual-grid">
                  <Input
                    label="Start time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(event) => setFormData({ ...formData, scheduledTime: event.target.value })}
                    error={errors.scheduledTime}
                  />
                  <Select
                    label="Duration"
                    value={formData.durationMinutes}
                    onChange={(event) => setFormData({ ...formData, durationMinutes: Number(event.target.value) })}
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes</option>
                  </Select>
                </div>

                <Input
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(event) => setFormData({ ...formData, timezone: event.target.value })}
                />

                <Toggle
                  checked={formData.includeMeetLink}
                  onChange={(event) => setFormData({ ...formData, includeMeetLink: event.target.checked })}
                  label="Include Google Meet link"
                  sublabel="Attach a ready-to-join link in the calendar event."
                />
                <Toggle
                  checked={formData.enableTranscript}
                  onChange={(event) => setFormData({ ...formData, enableTranscript: event.target.checked })}
                  label="AI transcript enabled"
                  sublabel="Prepare the workspace for notes, summaries, and action items."
                />
              </div>
            </Card>

            <Card tone="dark" style={{ minHeight: '240px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.68)' }}>
                Session summary
              </div>
              <div style={{ marginTop: '12px', fontSize: '34px', fontWeight: 800, lineHeight: '1.1' }}>
                {formData.subject || 'Untitled meeting'}
              </div>
              <div style={{ marginTop: '10px', fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.78)' }}>
                {scheduledAt
                  ? `${new Date(scheduledAt).toLocaleDateString()} · ${formData.scheduledTime} · ${formData.collaborators.length + 1} participants`
                  : 'Select a valid schedule to preview the session.'}
              </div>

              <div style={{ display: 'grid', gap: '12px', marginTop: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Video size={16} />
                  <span>Meet link {formData.includeMeetLink ? 'included' : 'disabled'}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <WandSparkles size={16} />
                  <span>{formData.enableTranscript ? 'AI transcript enabled' : 'Transcript disabled'}</span>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
                trailing={<ChevronRight size={16} />}
              >
                Schedule meeting
              </Button>
            </Card>
          </div>
        </div>

        {submitError && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px 18px',
              borderRadius: '18px',
              background: C.dangerTint,
              color: C.danger,
              fontWeight: 700,
            }}
          >
            {submitError}
          </div>
        )}
      </form>
    </div>
  );
};
