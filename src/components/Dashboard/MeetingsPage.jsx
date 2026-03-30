import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import { Button, C, Spinner, EmptyState } from '../ui';
import { MeetingCard } from './MeetingCard';

export const MeetingsPage = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, loading, refresh } = usePolling(() => api.getMeetings({ status, page, limit: 20 }), 30000);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const statuses = [
    { label: 'All', value: '' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Invited', value: 'email_sent' },
    { label: 'Reminded', value: 'reminders_sent' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px 0' }}>All Meetings</h1>
          <p style={{ color: C.textMuted, margin: 0 }}>Manage your entire meeting history.</p>
        </div>
        <Button onClick={() => window.location.href = '/compose'}>✦ New Meeting</Button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${status === s.value ? C.accent : C.border}`,
              background: status === s.value ? `${C.accent}11` : 'transparent',
              color: status === s.value ? C.accent : C.textMuted,
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner size={48} /></div>
      ) : data?.meetings.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.meetings.map(m => (
              <MeetingCard key={m._id} meeting={m} onRefresh={refresh} />
            ))}
          </div>
          
          {data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
              <Button 
                variant="secondary" 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </Button>
              <span style={{ fontSize: '14px', color: C.textMuted }}>Page {page} of {data.totalPages}</span>
              <Button 
                variant="secondary" 
                disabled={page === data.totalPages} 
                onClick={() => setPage(page + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          icon="📭" 
          title="No meetings found" 
          sub={status ? `No meetings with status "${status}" were found.` : "You haven't scheduled any meetings yet."} 
        />
      )}
    </div>
  );
};
