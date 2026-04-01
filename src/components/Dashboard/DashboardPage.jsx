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

const WINDOW_OPTIONS = [
  { label: 'Last 7 Days', value: 7 },
  { label: '30 Days', value: 30 },
];

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

const getWindowStart = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [rangeDays, setRangeDays] = React.useState(7);
  const { data: meetingsData, loading, refresh: refreshMeetings } = usePolling(() => api.getMeetings({ limit: 100 }), 15000);

  const meetings = React.useMemo(
    () =>
      [...(meetingsData?.meetings || [])].sort(
        (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt),
      ),
    [meetingsData],
  );

  const scopedMeetings = React.useMemo(() => {
    const windowStart = getWindowStart(rangeDays);
    return meetings.filter((meeting) => new Date(meeting.scheduledAt) >= windowStart);
  }, [meetings, rangeDays]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const total = scopedMeetings.length;
    const completed = scopedMeetings.filter((meeting) => meeting.status === 'completed').length;
    const failed = scopedMeetings.filter((meeting) => meeting.status === 'failed').length;
    const cancelled = scopedMeetings.filter((meeting) => meeting.status === 'cancelled').length;
    const upcoming = scopedMeetings.filter(
      (meeting) => new Date(meeting.scheduledAt) > now && !['cancelled', 'failed'].includes(meeting.status),
    ).length;
    const pending = total - completed - failed - cancelled;

    return { total, upcoming, pending, completed, failed, cancelled };
  }, [scopedMeetings]);

  const recentMeetings = React.useMemo(() => scopedMeetings.slice(0, 5), [scopedMeetings]);
  const upcomingMeeting = scopedMeetings
    .filter((meeting) => new Date(meeting.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  const handleRefresh = () => {
    refreshMeetings();
  };

  const serviceHealth = [
    { label: 'Recording Service', score: '99.9%', color: C.success },
    { label: 'AI Transcription', score: '98.4%', color: C.success },
    { label: 'Calendar Integration', score: '92.1%', color: C.warning },
  ];

  if (!loading && meetings.length === 0) {
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
            {WINDOW_OPTIONS.map((option) => {
              const active = rangeDays === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRangeDays(option.value)}
                  aria-pressed={active}
                  style={{
                    border: 'none',
                    background: active ? C.surfaceSoft : 'transparent',
                    color: active ? C.text : C.textDim,
                    fontWeight: active ? 800 : 700,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
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
          {loading && recentMeetings.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Spinner size={30} />
            </div>
          ) : recentMeetings.length === 0 ? (
            <div style={{ fontSize: '14px', lineHeight: '1.7', color: C.textMuted }}>
              No meetings fall inside the selected {rangeDays}-day window yet.
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
                  {recentMeetings.map((meeting, index) => (
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
          <Card
            title="Service health"
            actions={
              <Button variant="ghost" onClick={() => navigate('/logs')}>
                Full system status
              </Button>
            }
          >
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
          </Card>

          <Card
            tone="accent"
            title="Integration hub"
            subtitle="Connect MeetBot to your workspace tools to automate transcripts and action items."
          >
            <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
              {[
                {
                  label: 'Open composer',
                  icon: Mail,
                  onClick: () => navigate('/compose'),
                },
                {
                  label: 'Review activity logs',
                  icon: MessageSquareMore,
                  onClick: () => navigate('/logs'),
                },
                {
                  label: 'Open workspace settings',
                  icon: Cloud,
                  onClick: () => navigate('/settings?section=workspace'),
                },
              ].map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={onClick}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.white,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} />
                </button>
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
