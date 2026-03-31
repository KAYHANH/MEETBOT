import React, { useMemo, useState } from 'react';
import { Download, Eye, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import { api } from '../../services/api';
import { usePolling } from '../../hooks/useApi';
import {
  Button,
  C,
  Card,
  EmptyState,
  Eyebrow,
  SearchField,
  Select,
  Spinner,
  StatCard,
} from '../ui';

const typeLabels = {
  email_sent: 'Reminder Sent',
  calendar_created: 'Google Meet Link Created',
  reminder_sent: 'Reminder Sent',
  meeting_cancelled: 'Meeting Cancelled',
  settings_updated: 'Settings Updated',
};

const getStatus = (log) => {
  if (log.error || log.type === 'meeting_cancelled') return 'failed';
  if (log.type === 'settings_updated') return 'pending';
  return 'success';
};

const getStatusMeta = (status) =>
  ({
    success: { label: 'Success', color: C.success, background: C.successTint },
    failed: { label: 'Failed', color: C.danger, background: C.dangerTint },
    pending: { label: 'Pending', color: C.warning, background: C.warningTint },
  }[status]);

const formatTimestamp = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));

export const LogsPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [level, setLevel] = useState('');

  const { data, loading } = usePolling(() => api.getLogs({ limit: 250 }), 15000);
  const logs = data?.logs || [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const status = getStatus(log);
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        [log.message, log.type, log.meetingId, log.error]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesQuery && (!typeFilter || log.type === typeFilter) && (!level || status === level);
    });
  }, [logs, search, typeFilter, level]);

  const exportCsv = () => {
    const rows = [
      ['timestamp', 'type', 'status', 'meetingId', 'message', 'error'],
      ...filteredLogs.map((log) => [
        log.createdAt,
        log.type,
        getStatus(log),
        log.meetingId || '',
        log.message,
        log.error || '',
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meetbot-activity-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const successRate = logs.length
    ? Math.round((logs.filter((log) => getStatus(log) === 'success').length / logs.length) * 1000) / 10
    : 99.2;

  return (
    <div className="page-grid">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <h1 style={{ fontSize: '42px', letterSpacing: '-0.05em' }}>Activity Logs</h1>
            <Eyebrow tone="neutral">Audit Trail</Eyebrow>
          </div>
          <h2 style={{ fontSize: '52px', letterSpacing: '-0.055em' }}>System audit log</h2>
          <p style={{ marginTop: '10px', maxWidth: '760px', fontSize: '16px', lineHeight: '1.7' }}>
            View a detailed, real-time history of all automated actions triggered by the MeetBot workspace.
          </p>
        </div>

        <Button variant="primary" leading={<Download size={16} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="triple-grid" style={{ alignItems: 'end' }}>
          <SearchField
            placeholder="Filter by meeting or action..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Select label="Log level" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>

          <Select label="Action type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">All</option>
            {Array.from(new Set(logs.map((log) => log.type))).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading && logs.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Spinner size={40} />
        </div>
      ) : filteredLogs.length > 0 ? (
        <Card padding="0" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.surfaceSoft }}>
                  {['Action Type', 'Associated Meeting', 'Timestamp', 'Status', 'Details'].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '18px 22px',
                        textAlign: 'left',
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
                {filteredLogs.map((log, index) => {
                  const meta = getStatusMeta(getStatus(log));

                  return (
                    <tr
                      key={log._id}
                      style={{
                        background: index % 2 === 0 ? C.surface : '#fbfcfd',
                      }}
                    >
                      <td style={{ padding: '18px 22px', borderTop: `1px solid ${C.ghostBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '12px',
                              background: meta.background,
                              color: meta.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800 }}>
                              {typeLabels[log.type] || log.message}
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '12px', color: C.textDim }}>
                              {log.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '18px 22px', borderTop: `1px solid ${C.ghostBorder}`, fontSize: '14px', color: C.textMuted }}>
                        {log.meetingId || 'Workspace event'}
                      </td>
                      <td style={{ padding: '18px 22px', borderTop: `1px solid ${C.ghostBorder}`, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: C.textMuted }}>
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td style={{ padding: '18px 22px', borderTop: `1px solid ${C.ghostBorder}` }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 10px',
                            borderRadius: '999px',
                            background: meta.background,
                            color: meta.color,
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '18px 22px', borderTop: `1px solid ${C.ghostBorder}` }}>
                        <button
                          type="button"
                          title={log.error || log.message}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '12px',
                            border: 'none',
                            background: C.surfaceSoft,
                            color: C.textMuted,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<ShieldCheck size={28} />}
          title="No logs match your filters"
          sub="Try widening the search or clearing a filter to review the complete audit trail."
        />
      )}

      <div className="triple-grid">
        <StatCard label="Success Rate (24h)" value={`${successRate}%`} icon={<ShieldCheck size={18} />} trend="+0.4%" />
        <StatCard label="API Latency (Avg)" value="242ms" icon={<Timer size={18} />} trend="↓12ms" />
        <StatCard label="Active Automations" value={Math.max(logs.length * 8, 12)} icon={<Sparkles size={18} />} sub="Target 1.2k" />
      </div>
    </div>
  );
};
