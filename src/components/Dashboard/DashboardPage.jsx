import React from 'react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import { StatCard, Card, Button, C, Spinner, EmptyState } from '../ui';
import { MeetingCard } from './MeetingCard';

export const DashboardPage = () => {
  const { data: stats, loading: statsLoading, refresh: refreshStats } = usePolling(api.getMeetingStats.bind(api));
  const { data: meetingsData, loading: meetingsLoading, refresh: refreshMeetings } = usePolling(() => api.getMeetings({ limit: 5 }));

  const loading = statsLoading || meetingsLoading;

  const handleRefresh = () => {
    refreshStats();
    refreshMeetings();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ color: C.textMuted, margin: 0 }}>Overview of your automated meetings.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleRefresh} loading={loading}>↻ Refresh</Button>
          <Button onClick={() => window.location.href = '/compose'}>✦ New Meeting</Button>
        </div>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <StatCard label="Total Meetings" value={stats.total} icon="📊" />
          <StatCard label="Upcoming" value={stats.upcoming} icon="📅" color={C.info} />
          <StatCard label="Pending" value={stats.pending} icon="⏰" color={C.warning} />
          <StatCard label="Completed" value={stats.completed} icon="✓" color={C.success} />
          <StatCard label="Cancelled" value={stats.cancelled} icon="❌" color={C.danger} />
          <StatCard label="Failed" value={stats.failed} icon="⚠" color={C.danger} />
        </div>
      )}

      {stats?.total === 0 && !loading && (
        <Card style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Welcome to MeetBot!</h2>
          <p style={{ color: C.textMuted, maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            You haven't scheduled any meetings yet. MeetBot helps you automate invitations, 
            calendar events, and reminders using your Google account.
          </p>
          <Button onClick={() => window.location.href = '/compose'} style={{ padding: '12px 32px' }}>
            Schedule Your First Meeting
          </Button>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Recent Meetings</h3>
          {meetingsLoading && !meetingsData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={32} /></div>
          ) : meetingsData?.meetings.length > 0 ? (
            meetingsData.meetings.map(m => (
              <MeetingCard key={m._id} meeting={m} onRefresh={handleRefresh} />
            ))
          ) : (
            <EmptyState icon="📭" title="No meetings found" sub="Your scheduled meetings will appear here." />
          )}
          {meetingsData?.meetings.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => window.location.href = '/meetings'}>View All Meetings →</Button>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>How it works</h3>
          <Card style={{ padding: '20px' }}>
            {[
              { n: '1', t: 'Compose', d: 'Enter recipient details and meeting time.' },
              { n: '2', t: 'Automate', d: 'MeetBot sends invites and creates calendar events.' },
              { n: '3', t: 'Remind', d: 'Participants get email alerts 24h and 1h before.' },
              { n: '4', t: 'Meet', d: 'Everyone gets a "Join Now" link at meeting time.' }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i === 3 ? 0 : '20px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  background: C.accent, 
                  color: '#000', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '800',
                  flexShrink: 0
                }}>{step.n}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{step.t}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted }}>{step.d}</div>
                </div>
              </div>
            ))}
          </Card>
          
          <Card title="Free Mode" style={{ background: `${C.success}08`, borderColor: `${C.success}33` }}>
            <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>
              MeetBot is 100% free. It uses your own Google account to send emails and manage calendar events.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
