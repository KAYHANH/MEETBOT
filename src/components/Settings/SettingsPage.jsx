import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BellRing,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import {
  Button,
  C,
  Card,
  EmptyState,
  Input,
  Select,
} from '../ui';

const presetDurations = [30, 60, 90];

const buildReminderPreview = (minutes) => {
  const parsed = minutes
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value));

  return parsed.map((value) => ({
    value,
    label: value >= 60 ? `${value / 60}h` : `${value}m`,
    caption: value >= 60 ? 'Early sync' : 'Last call',
  }));
};

const normalizeSearch = (value) => value.trim().toLowerCase();
const matchesQuery = (query, keywords) =>
  !query || keywords.some((keyword) => normalizeSearch(keyword).includes(query));

export const SettingsPage = () => {
  const { isDemoMode } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: settings, loading: loadingSettings } = useApi(api.getSettings.bind(api), true);
  const { execute: updateSettings, loading: saving } = useApi(api.updateSettings.bind(api));

  const [formData, setFormData] = useState({
    emailReminderMinutes: '1440, 60',
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultMeetingDuration: 60,
    automationMode: 'smart',
  });
  const [saved, setSaved] = useState(false);
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    if (!settings) return;
    const normalized = {
      emailReminderMinutes: settings.emailReminderMinutes.join(', '),
      defaultTimezone: settings.defaultTimezone,
      defaultMeetingDuration: settings.defaultMeetingDuration,
      automationMode: settings.automationMode || 'smart',
    };

    setFormData(normalized);
    setBaseline(normalized);
  }, [settings]);

  const searchQuery = normalizeSearch(searchParams.get('q') || '');
  const activeSection = searchParams.get('section');

  useEffect(() => {
    if (!activeSection) return;

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(`${activeSection}-section`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [activeSection]);

  const reminderPreview = useMemo(
    () => buildReminderPreview(formData.emailReminderMinutes),
    [formData.emailReminderMinutes],
  );

  const visibleSections = useMemo(() => ({
    reminders: matchesQuery(searchQuery, ['email reminders', 'reminder intervals', 'alerts', 'timeline']),
    automation: matchesQuery(searchQuery, ['automation logic', 'smart detection', 'universal catch', 'workflow']),
    defaults: matchesQuery(searchQuery, ['defaults', 'timezone', 'duration', 'meeting duration']),
    workspace: matchesQuery(searchQuery, ['workspace', 'members', 'account', 'plan']),
  }), [searchQuery]);

  const visibleSectionCount = Object.values(visibleSections).filter(Boolean).length;

  const handleSave = async () => {
    const minutes = formData.emailReminderMinutes
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => !Number.isNaN(value));

    try {
      await updateSettings({
        emailReminderMinutes: minutes,
        defaultTimezone: formData.defaultTimezone,
        defaultMeetingDuration: formData.defaultMeetingDuration,
        automationMode: formData.automationMode,
      });
      setSaved(true);
      setBaseline(formData);
      window.setTimeout(() => setSaved(false), 2800);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDiscard = () => {
    if (baseline) setFormData(baseline);
  };

  return (
    <div className="page-grid">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '56px', letterSpacing: '-0.055em' }}>Settings</h1>
          <p style={{ marginTop: '10px', maxWidth: '680px', fontSize: '16px', lineHeight: '1.7' }}>
            Configure your meeting automation defaults and global workspace behavior.
          </p>
          <div style={{ marginTop: '14px', fontSize: '13px', color: C.textDim }}>
            {loadingSettings
              ? 'Syncing your saved workspace defaults...'
              : 'Workspace defaults are ready to edit.'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={handleDiscard}>
            Discard
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save settings
          </Button>
        </div>
      </div>

      <Card
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px',
          flexWrap: 'wrap',
          background: isDemoMode ? C.accentTint : C.successTint,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: C.surface,
              color: C.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>
              {isDemoMode ? 'Demo workspace active' : 'Live workspace connected'}
            </div>
            <div style={{ marginTop: '4px', fontSize: '14px', color: C.textMuted }}>
              {isDemoMode
                ? 'This session is using local sample data, so you can explore safely without changing real meetings or credentials.'
                : 'Google sign-in and MongoDB are connected for this workspace, so your real meeting defaults save immediately.'}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '999px',
            background: C.surface,
            color: isDemoMode ? C.accent : C.success,
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {isDemoMode ? 'Sample data' : 'Live data'}
        </div>
      </Card>

      <div className="settings-grid">
        <div className="page-grid">
          {visibleSections.reminders && (
            <div id="reminders-section">
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
                      <BellRing size={16} />
                    </span>
                    Email reminders
                  </span>
                }
              >
                <Input
                  label="Reminder intervals (minutes)"
                  value={formData.emailReminderMinutes}
                  onChange={(event) => setFormData({ ...formData, emailReminderMinutes: event.target.value })}
                  hint="Define intervals in minutes prior to meeting start. 1440m = 24h."
                />

                <div
                  style={{
                    marginTop: '22px',
                    padding: '18px',
                    borderRadius: '20px',
                    background: C.surfaceSoft,
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim }}>
                    Timeline preview
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
                    {reminderPreview.map((item) => (
                      <div key={`${item.value}-${item.label}`} style={{ minWidth: '72px', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: C.accent,
                            margin: '0 auto',
                            boxShadow: '0 0 0 6px rgba(62, 118, 254, 0.12)',
                          }}
                        />
                        <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 800 }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: C.textDim }}>{item.caption}</div>
                      </div>
                    ))}
                    <div style={{ minWidth: '72px', textAlign: 'center' }}>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: C.danger,
                          margin: '0 auto',
                          boxShadow: '0 0 0 6px rgba(159, 64, 61, 0.12)',
                        }}
                      />
                      <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 800 }}>Meeting</div>
                      <div style={{ fontSize: '12px', color: C.textDim }}>Start time</div>
                    </div>
                    <div style={{ minWidth: '72px', textAlign: 'center' }}>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: C.accentSoft,
                          margin: '0 auto',
                          boxShadow: '0 0 0 6px rgba(62, 118, 254, 0.12)',
                        }}
                      />
                      <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 800 }}>Now</div>
                      <div style={{ fontSize: '12px', color: C.textDim }}>Alert</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {visibleSections.automation && (
            <div id="automation-section">
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
                      <Workflow size={16} />
                    </span>
                    Automation logic
                  </span>
                }
              >
                <div className="dual-grid">
                  {[
                    {
                      id: 'smart',
                      title: 'Smart detection',
                      copy: 'Auto-join valid links and adapt the reminder sequence automatically.',
                    },
                    {
                      id: 'universal',
                      title: 'Universal catch',
                      copy: 'Join all calendar items and use the same workflow for every session.',
                    },
                  ].map((option) => {
                    const active = formData.automationMode === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, automationMode: option.id })}
                        style={{
                          textAlign: 'left',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '18px',
                          background: active ? C.accentTint : C.surfaceSoft,
                          boxShadow: active ? `inset 0 0 0 2px ${C.accent}` : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 800 }}>{option.title}</div>
                        <div style={{ marginTop: '8px', fontSize: '14px', lineHeight: '1.6', color: C.textMuted }}>
                          {option.copy}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="page-grid">
          {visibleSections.defaults && (
            <div id="defaults-section">
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
                      <Sparkles size={16} />
                    </span>
                    Defaults
                  </span>
                }
              >
                <div className="page-grid" style={{ gap: '18px' }}>
                  <Select
                    label="Default timezone"
                    value={formData.defaultTimezone}
                    onChange={(event) => setFormData({ ...formData, defaultTimezone: event.target.value })}
                  >
                    <option value={formData.defaultTimezone}>{formData.defaultTimezone}</option>
                    <option value="Asia/Calcutta">Asia/Calcutta (GMT +5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </Select>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textDim, marginBottom: '10px' }}>
                      Default duration (min)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {presetDurations.map((value) => {
                        const active = formData.defaultMeetingDuration === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData({ ...formData, defaultMeetingDuration: value })}
                            style={{
                              minWidth: '56px',
                              padding: '12px 16px',
                              borderRadius: '14px',
                              border: 'none',
                              background: active ? C.accent : C.surfaceSoft,
                              color: active ? C.white : C.textMuted,
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {visibleSections.workspace && (
            <div id="workspace-section">
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
                      <BriefcaseBusiness size={16} />
                    </span>
                    Workspace
                  </span>
                }
              >
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: C.surfaceSoft,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '16px',
                        background: C.inverse,
                        color: C.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                      }}
                    >
                      mb
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800 }}>MeetBot HQ</div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: C.textDim }}>
                        meetbot.app/hq-workspace
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: C.textMuted }}>
                    <span>Active members</span>
                    <span style={{ fontWeight: 800, color: C.text }}>12 / 50</span>
                  </div>
                  <div
                    style={{
                      marginTop: '10px',
                      height: '8px',
                      borderRadius: '999px',
                      background: C.surface,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '24%',
                        height: '100%',
                        background: `linear-gradient(145deg, ${C.accent} 0%, ${C.accentSoft} 100%)`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {visibleSectionCount === 0 && (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No settings match that search"
          sub="Try a broader keyword such as reminder, automation, timezone, or workspace."
        />
      )}

      {saved && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '18px',
            background: C.successTint,
            color: C.success,
            fontWeight: 800,
          }}
        >
          Settings saved successfully.
        </div>
      )}
    </div>
  );
};
