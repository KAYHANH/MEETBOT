import React, { useState } from 'react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import { Card, Badge, C, Spinner, EmptyState, Input } from '../ui';

export const LogsPage = () => {
  const [filter, setFilter] = useState('');
  const { data, loading } = usePolling(() => api.getLogs({ limit: 100 }), 15000);

  const filteredLogs = data?.logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) || 
    log.type.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  const getTypeColor = (type) => {
    switch (type) {
      case 'email_sent': return C.success;
      case 'calendar_created': return C.info;
      case 'reminder_sent': return C.warning;
      case 'meeting_cancelled': return C.danger;
      case 'error': return C.danger;
      default: return C.textMuted;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 4px 0' }}>Activity Logs</h1>
          <p style={{ color: C.textMuted, margin: 0 }}>Audit trail of all automated actions.</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input 
            placeholder="Filter logs..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>

      {loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Spinner size={48} /></div>
      ) : filteredLogs.length > 0 ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: `${C.bg}88`, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '16px', fontSize: '12px', color: C.textDim, textTransform: 'uppercase' }}>Time</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: C.textDim, textTransform: 'uppercase' }}>Event</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: C.textDim, textTransform: 'uppercase' }}>Details</th>
                  <th style={{ padding: '16px', fontSize: '12px', color: C.textDim, textTransform: 'uppercase' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={log._id} style={{ borderBottom: i === filteredLogs.length - 1 ? 'none' : `1px solid ${C.border}` }}>
                    <td style={{ padding: '16px', fontSize: '13px', color: C.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTypeColor(log.type) }} />
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{log.message}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: C.textMuted }}>
                      {log.error ? (
                        <div style={{ color: C.danger, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                          Error: {log.error}
                        </div>
                      ) : (
                        'Action completed successfully'
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontFamily: "'JetBrains Mono', monospace", 
                        background: `${C.border}88`, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        color: C.textDim
                      }}>
                        {log.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState icon="📋" title="No logs found" sub="Activity logs will appear here as MeetBot performs actions." />
      )}
    </div>
  );
};
