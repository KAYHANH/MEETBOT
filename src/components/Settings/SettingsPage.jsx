import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { Card, Input, Button, C, Spinner } from '../ui';

export const SettingsPage = () => {
  const [formData, setFormData] = useState({
    emailReminderMinutes: '1440, 60',
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultMeetingDuration: 60
  });

  const { data: settings, loading: loadingSettings } = useApi(api.getSettings.bind(api), true);
  const { execute: updateSettings, loading: saving } = useApi(api.updateSettings.bind(api));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        emailReminderMinutes: settings.emailReminderMinutes.join(', '),
        defaultTimezone: settings.defaultTimezone,
        defaultMeetingDuration: settings.defaultMeetingDuration
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const minutes = formData.emailReminderMinutes
      .split(',')
      .map(m => parseInt(m.trim()))
      .filter(m => !isNaN(m));

    try {
      await updateSettings({
        emailReminderMinutes: minutes,
        defaultTimezone: formData.defaultTimezone,
        defaultMeetingDuration: formData.defaultMeetingDuration
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loadingSettings) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner size={48} /></div>;

  const reminderList = formData.emailReminderMinutes.split(',').map(m => m.trim()).filter(m => m);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>Settings</h1>
        <p style={{ color: C.textMuted, margin: 0 }}>Configure your meeting automation defaults.</p>
      </div>

      <Card title="Email Reminders">
        <Input 
          label="Reminder Intervals (minutes before)" 
          placeholder="e.g. 1440, 60" 
          value={formData.emailReminderMinutes}
          onChange={e => setFormData({...formData, emailReminderMinutes: e.target.value})}
          hint="Comma-separated minutes. 1440 = 24 hours, 60 = 1 hour."
        />
        
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: C.textMuted, marginBottom: '12px' }}>Timeline Preview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {reminderList.map((m, i) => (
              <React.Fragment key={i}>
                <div style={{ 
                  padding: '6px 12px', 
                  background: `${C.warning}22`, 
                  color: C.warning, 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: '700' 
                }}>
                  ⏰ {m}m before
                </div>
                <span style={{ color: C.textDim }}>→</span>
              </React.Fragment>
            ))}
            <div style={{ 
              padding: '6px 12px', 
              background: `${C.success}22`, 
              color: C.success, 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '700' 
            }}>
              🏁 Meeting
            </div>
            <span style={{ color: C.textDim }}>→</span>
            <div style={{ 
              padding: '6px 12px', 
              background: `${C.info}22`, 
              color: C.info, 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '700' 
            }}>
              🔔 Now Alert
            </div>
          </div>
        </div>
      </Card>

      <Card title="Defaults">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Input 
            label="Default Timezone" 
            value={formData.defaultTimezone}
            onChange={e => setFormData({...formData, defaultTimezone: e.target.value})}
          />
          <Input 
            label="Default Duration (minutes)" 
            type="number"
            value={formData.defaultMeetingDuration}
            onChange={e => setFormData({...formData, defaultMeetingDuration: parseInt(e.target.value)})}
          />
        </div>
      </Card>

      <div style={{ 
        background: `${C.success}08`, 
        border: `1px solid ${C.success}33`, 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '24px',
        display: 'flex',
        gap: '16px'
      }}>
        <div style={{ fontSize: '24px' }}>🛡️</div>
        <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: '1.5' }}>
          <strong style={{ color: C.text }}>Free Mode Active</strong><br />
          MeetBot is using your own Google account for all operations. 
          There are no monthly fees or per-meeting costs.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
        {saved && <span style={{ color: C.success, fontSize: '14px', fontWeight: '600' }}>✓ Settings saved</span>}
        <Button onClick={handleSave} loading={saving} style={{ padding: '12px 40px' }}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};
