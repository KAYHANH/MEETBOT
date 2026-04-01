import React, { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, Filter, Plus, Sparkles, Video } from 'lucide-react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import {
  AvatarStack,
  Button,
  C,
  Card,
  EmptyState,
  Eyebrow,
  SearchField,
  Spinner,
  StatCard,
} from '../ui';
import { MeetingCard } from './MeetingCard';

const PAGE_SIZE = 4;

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Invited', value: 'email_sent' },
  { label: 'Reminded', value: 'reminders_sent' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const filterSearch = (meeting, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    meeting.subject,
    meeting.recipientName,
    meeting.recipientEmail,
    meeting.timezone,
    meeting._id,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalized));
};

export const MeetingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const { data, loading, refresh } = usePolling(() => api.getMeetings({ limit: 100 }), 30000);
  const meetings = data?.meetings || [];
  const querySearch = searchParams.get('q') ?? '';
  const queryStatus = searchParams.get('status') ?? '';
  const deferredSearch = useDeferredValue(search);

  React.useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  React.useEffect(() => {
    setStatus(queryStatus);
  }, [queryStatus]);

  React.useEffect(() => {
    if (querySearch || queryStatus) {
      setFiltersOpen(true);
    }
  }, [querySearch, queryStatus]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(
      (meeting) => (!status || meeting.status === status) && filterSearch(meeting, deferredSearch),
    );
  }, [meetings, status, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const pagedMeetings = filteredMeetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [status, search]);

  const upcomingToday = filteredMeetings.filter((meeting) => {
    const date = new Date(meeting.scheduledAt);
    const now = new Date();
    return (
      date.toDateString() === now.toDateString() &&
      date > now &&
      !['cancelled', 'failed', 'completed'].includes(meeting.status)
    );
  }).length;

  const automationScore = filteredMeetings.length
    ? Math.max(
        70,
        Math.round(
          (filteredMeetings.filter((meeting) => !['failed', 'cancelled'].includes(meeting.status)).length /
            filteredMeetings.length) *
            100,
        ),
      )
    : 94;

  const participants = filteredMeetings.map((meeting) => meeting.recipientName);
  const hasActiveFilters = Boolean(search.trim() || status);

  return (
    <div className="page-grid">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>Management</Eyebrow>
          <h1 style={{ marginTop: '14px', fontSize: '48px', letterSpacing: '-0.05em' }}>All meetings</h1>
          <p style={{ marginTop: '10px', maxWidth: '640px', fontSize: '16px', lineHeight: '1.7' }}>
            Manage your upcoming schedules, review transcripts from previous sessions,
            and automate follow-ups for your workspace.
          </p>
        </div>

        <Button onClick={() => navigate('/compose')} leading={<Plus size={16} />}>
          New Meeting
        </Button>
      </div>

      <div className="triple-grid">
        <StatCard label="Total Meetings" value={filteredMeetings.length || meetings.length} icon={<Video size={18} />} trend="+12%" />
        <StatCard label="Upcoming Today" value={upcomingToday} icon={<CalendarClock size={18} />} sub="Active" />
        <StatCard label="Automation Score" value={`${automationScore}%`} icon={<Sparkles size={18} />} tone="accent" sub="Premium" />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <SearchField
              placeholder="Search meetings, participants, or notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <AvatarStack items={participants} />
            <Button
              variant="secondary"
              leading={<Filter size={16} />}
              onClick={() => {
                if (hasActiveFilters) {
                  setSearch('');
                  setStatus('');
                  return;
                }
                setFiltersOpen((current) => !current);
              }}
            >
              {hasActiveFilters ? 'Clear filters' : filtersOpen ? 'Hide filters' : 'Show filters'}
            </Button>
            <Button variant="ghost" onClick={refresh}>
              Refresh queue
            </Button>
          </div>
        </div>

        {(filtersOpen || hasActiveFilters) && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                style={{
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '999px',
                  background: status === option.value ? C.accentTint : C.surfaceSoft,
                  color: status === option.value ? C.accent : C.textMuted,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </Card>

      {loading && meetings.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Spinner size={40} />
        </div>
      ) : pagedMeetings.length > 0 ? (
        <>
          <div className="page-grid">
            {pagedMeetings.map((meeting) => (
              <MeetingCard key={meeting._id} meeting={meeting} onRefresh={refresh} />
            ))}
          </div>

          <Card padding="18px 20px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '14px', color: C.textMuted }}>
                Showing {filteredMeetings.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, filteredMeetings.length)} of {filteredMeetings.length} results
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
                  const pageNumber = index + 1;
                  const active = pageNumber === page;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        border: 'none',
                        background: active ? C.accent : C.surfaceSoft,
                        color: active ? C.white : C.textMuted,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<Video size={28} />}
          title="No meetings found"
          sub={
            status
              ? `No meetings with the selected status match your current filters.`
              : `Create your first meeting to start building the queue.`
          }
          actions={
            <Button onClick={() => navigate('/compose')} leading={<Plus size={16} />}>
              Create meeting
            </Button>
          }
        />
      )}
    </div>
  );
};
