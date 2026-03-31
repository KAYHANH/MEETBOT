import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Clock3,
  Cloud,
  Mail,
  MessageSquareMore,
  Video,
} from 'lucide-react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import {
  Badge,
  Button,
  C,
  Card,
  EmptyState,
  Eyebrow,
  Spinner,
  StatCard,
} from '../ui';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatDuration = (minutes) => {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading, refresh: refreshStats } = usePolling(api.getMeetingStats.bind(api));
  const { data: meetingsData, loading: meetingsLoading, refresh: refreshMeetings } = usePolling(() => api.getMeetings({ limit: 5 }));

  const loading = statsLoading || meetingsLoading;
  const meetings = meetingsData?.meetings || [];
  const upcomingMeeting = meetings
    .filter((meeting) => new Date(meeting.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  const handleRefresh = () => {
    refreshStats();
    refreshMeetings();
  };

  const serviceHealth = [
    { label: 'Recording Service', score: '99.9%', color: C.success },
    { label: 'AI Transcription', score: '98.4%', color: C.success },
    { label: 'Calendar Integration', score: '92.1%', color: C.warning },
  ];

  if (!loading && stats?.total === 0) {
    return (
      <div className="page-grid">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Workspace overview</Eyebrow>
            <h1 style={{ marginTop: '14px', fontSize: '48px', letterSpacing: '-0.05em' }}>Overview</h1>
            <p style={{ marginTop: '10px', maxWidth: '560px', fontSize: '16px', lineHeight: '1.7' }}>
              System performance and meeting status.
            </p>
          </div>
          <Button variant="secondary" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>

        <EmptyState
          icon={<Video size={28} />}
          title="Your workspace is ready"
          sub="Schedule your first meeting to populate analytics, service health, and the operations timeline."
          actions={
            <Button onClick={() => navigate('/compose')} leading={<CalendarDays size={16} />}>
              Create first meeting
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-grid">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Workspace overview</Eyebrow>
          <h1 style={{ marginTop: '14px', fontSize: '48px', letterSpacing: '-0.05em' }}>Overview</h1>
          <p style={{ marginTop: '10px', maxWidth: '560px', fontSize: '16px', lineHeight: '1.7' }}>
            System performance and meeting status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              gap: '6px',
              padding: '6px',
              borderRadius: '18px',
              background: C.surface,
              boxShadow: C.softShadow,
            }}
          >
            <button
              type="button"
              style={{
                border: 'none',
                background: C.surfaceSoft,
                color: C.text,
                fontWeight: 800,
                padding: '10px 14px',
                borderRadius: '12px',
              }}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              style={{
                border: 'none',
                background: 'transparent',
                color: C.textDim,
                fontWeight: 700,
                padding: '10px 14px',
                borderRadius: '12px',
              }}
            >
              30 Days
            </button>
          </div>

          <Button variant="secondary" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      {stats ? (
        <div className="kpi-grid">
          <StatCard label="Total" value={stats.total} icon={<Video size={18} />} trend="+12%" />
          <StatCard label="Upcoming" value={stats.upcoming} icon={<Clock3 size={18} />} />
          <StatCard label="Pending" value={stats.pending} icon={<CalendarDays size={18} />} />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={18} />} />
          <StatCard label="Cancelled" value={stats.cancelled} icon={<CircleX size={18} />} />
          <StatCard label="Failed" value={stats.failed} icon={<CircleAlert size={18} />} />
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <Spinner size={36} />
        </div>
      )}

      <div className="dashboard-grid">
        <Card
          title="Meeting performance"
          actions={
            <button
              type="button"
              onClick={() => navigate('/meetings')}
              style={{
                border: 'none',
                background: 'transparent',
                color: C.accent,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              View History
            </button>
          }
        >
          {meetingsLoading && meetings.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner size={30} />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    {['Meeting Subject', 'Status', 'Duration', 'Date'].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: 'left',
                          padding: '0 0 14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: C.textDim,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting, index) => (
                    <tr key={meeting._id}>
                      <td
                        style={{
                          padding: '18px 0',
                          borderTop: index === 0 ? `1px solid ${C.ghostBorder}` : `1px solid ${C.ghostBorder}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '14px',
                              background: C.surfaceSoft,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: C.textMuted,
                              flexShrink: 0,
                            }}
                          >
                            <Video size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: 800 }}>{meeting.subject}</div>
                            <div style={{ marginTop: '4px', fontSize: '13px', color: C.textMuted }}>
                              {meeting.recipientName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 0', borderTop: `1px solid ${C.ghostBorder}` }}>
                        <Badge status={meeting.status} />
                      </td>
                      <td
                        style={{
                          padding: '18px 0',
                          borderTop: `1px solid ${C.ghostBorder}`,
                          color: C.textMuted,
                          fontSize: '14px',
                        }}
                      >
                        {formatDuration(meeting.durationMinutes)}
                      </td>
                      <td
                        style={{
                          padding: '18px 0',
                          borderTop: `1px solid ${C.ghostBorder}`,
                          color: C.textMuted,
                          fontSize: '14px',
                        }}
                      >
                        {formatDate(meeting.scheduledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="page-grid">
          <Card title="Service health">
            <div style={{ display: 'grid', gap: '14px' }}>
              {serviceHealth.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    paddingBottom: '14px',
                    borderBottom: `1px solid ${C.ghostBorder}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: item.color,
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: C.textMuted }}>{item.score}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '18px', color: C.accent, fontWeight: 800 }}>Full system status</div>
          </Card>

          <Card
            tone="accent"
            title="Integration hub"
            subtitle="Connect MeetBot to your workspace tools to automate transcripts and action items."
          >
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              {[Mail, MessageSquareMore, Cloud].map((Icon, index) => (
                <div
                  key={index}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Up next">
            {upcomingMeeting ? (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '18px',
                    background: C.surfaceSoft,
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: C.surface,
                      display: 'grid',
                      placeItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: C.danger, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(upcomingMeeting.scheduledAt))}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>
                      {new Date(upcomingMeeting.scheduledAt).getDate()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{upcomingMeeting.subject}</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '1.6' }}>
                      Starts {formatDate(upcomingMeeting.scheduledAt)}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  style={{ marginTop: '18px' }}
                  trailing={<ArrowRight size={16} />}
                  onClick={() => navigate('/meetings')}
                >
                  Open meeting queue
                </Button>
              </div>
            ) : (
              <div style={{ fontSize: '14px', lineHeight: '1.7', color: C.textMuted }}>
                No upcoming meetings are scheduled yet.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
