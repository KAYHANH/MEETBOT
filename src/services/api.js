import axios from 'axios';

const DEMO_TOKEN = 'demo-mode';
const DEMO_STORAGE_KEY = 'meetbot_demo_data_v3';

const DEMO_USER = {
  userId: 'demo-user',
  email: 'demo@meetbot.local',
  name: 'MeetBot Demo',
  picture: 'https://api.dicebear.com/9.x/initials/svg?seed=MeetBot%20Demo'
};

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000).toISOString();

const createReminder = (minutesBefore, sent = false, sentAt = null) => ({
  type: minutesBefore === 0 ? 'email_now' : 'email',
  minutesBefore,
  sent,
  sentAt
});

const createAttendanceSession = (sessionName, startOffset, endOffset) => ({
  sessionName,
  startTime: minutesFromNow(startOffset),
  endTime: endOffset == null ? null : minutesFromNow(endOffset),
  durationMinutes:
    endOffset == null
      ? Math.max(1, Math.round(Math.abs(startOffset)))
      : Math.max(1, Math.round(endOffset - startOffset)),
});

const createAttendanceParticipant = ({
  participantName,
  participantType = 'signed_in',
  participantUser = null,
  participantResourceName,
  sessions,
}) => ({
  participantName,
  participantType,
  participantUser,
  participantResourceName,
  earliestStartTime: sessions[0]?.startTime || null,
  latestEndTime: sessions.at(-1)?.endTime || null,
  totalDurationMinutes: sessions.reduce((total, session) => total + (session.durationMinutes || 0), 0),
  sessions,
});

const createInitialDemoData = () => ({
  meetings: [
    {
      _id: 'demo-meeting-1',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Ava Johnson',
      recipientEmail: 'ava@example.com',
      participants: ['Ava Johnson', 'Product Team', 'Host'],
      subject: 'Product Sync: Q4 Roadmap',
      message: 'Let us walk through the latest onboarding flow and gather feedback.',
      scheduledAt: minutesFromNow(180),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 45,
      googleMeetLink: 'https://meet.google.com/demo-product-review',
      status: 'scheduled',
      reminders: [
        createReminder(1440),
        createReminder(60),
        createReminder(0)
      ],
      createdAt: minutesFromNow(-50),
      updatedAt: minutesFromNow(-30)
    },
    {
      _id: 'demo-meeting-2',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Noah Smith',
      recipientEmail: 'noah@example.com',
      participants: ['Noah Smith', 'Hiring Team'],
      subject: 'Interview: Senior Designer',
      message: 'Agenda: portfolio walkthrough and team collaboration patterns.',
      scheduledAt: minutesFromNow(300),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 45,
      googleMeetLink: 'https://meet.google.com/demo-senior-designer',
      status: 'email_sent',
      reminders: [
        createReminder(1440),
        createReminder(60),
        createReminder(0)
      ],
      createdAt: minutesFromNow(-120),
      updatedAt: minutesFromNow(-90)
    },
    {
      _id: 'demo-meeting-3',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Mia Patel',
      recipientEmail: 'mia@example.com',
      participants: ['Mia Patel', 'Marketing', 'AL'],
      subject: 'Marketing Alignment',
      message: 'Review the launch schedule and assign campaign owners.',
      scheduledAt: minutesFromNow(1560),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 60,
      googleMeetLink: 'https://meet.google.com/demo-marketing-alignment',
      status: 'reminders_sent',
      reminders: [
        createReminder(1440, true, minutesFromNow(120)),
        createReminder(60),
        createReminder(0)
      ],
      createdAt: minutesFromNow(-1440),
      updatedAt: minutesFromNow(-60)
    },
    {
      _id: 'demo-meeting-4',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Liam Chen',
      recipientEmail: 'liam@example.com',
      participants: ['Liam Chen', 'Engineering', 'Product'],
      subject: 'Weekly Retrospective',
      message: 'Discuss shipped work, blockers, and improvement areas for next sprint.',
      scheduledAt: minutesFromNow(-1200),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 60,
      googleMeetLink: 'https://meet.google.com/demo-retrospective',
      status: 'completed',
      reminders: [
        createReminder(1440, true, minutesFromNow(-2640)),
        createReminder(60, true, minutesFromNow(-1260)),
        createReminder(0, true, minutesFromNow(-1200))
      ],
      createdAt: minutesFromNow(-2800),
      updatedAt: minutesFromNow(-1180)
    },
    {
      _id: 'demo-meeting-5',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Sophia Rivera',
      recipientEmail: 'sophia@example.com',
      participants: ['Sophia Rivera', 'Finance', 'Ops'],
      subject: 'Budget Allocation FY25',
      message: 'Re-align quarterly spend and close out open budget approvals.',
      scheduledAt: minutesFromNow(-900),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 90,
      googleMeetLink: 'https://meet.google.com/demo-budget-allocation',
      status: 'cancelled',
      reminders: [
        createReminder(1440, true, minutesFromNow(-2340)),
        createReminder(60, false, null),
        createReminder(0)
      ],
      createdAt: minutesFromNow(-3000),
      updatedAt: minutesFromNow(-890)
    },
    {
      _id: 'demo-meeting-6',
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: 'Oliver Grant',
      recipientEmail: 'oliver@example.com',
      participants: ['Oliver Grant', 'Platform', 'Infra'],
      subject: 'Infrastructure Weekly Review',
      message: 'Inspect service latency, deployment stability, and risk register updates.',
      scheduledAt: minutesFromNow(-240),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      durationMinutes: 30,
      googleMeetLink: 'https://meet.google.com/demo-infra-review',
      status: 'failed',
      reminders: [
        createReminder(1440, true, minutesFromNow(-1680)),
        createReminder(60, true, minutesFromNow(-300)),
        createReminder(0, false, null)
      ],
      createdAt: minutesFromNow(-3200),
      updatedAt: minutesFromNow(-240)
    }
  ],
  settings: {
    emailReminderMinutes: [1440, 60],
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultMeetingDuration: 60,
    automationMode: 'smart',
  },
  logs: [
    {
      _id: 'demo-log-1',
      meetingId: 'demo-meeting-1',
      type: 'calendar_created',
      message: 'Google Meet link created for Product Sync: Q4 Roadmap',
      createdAt: minutesFromNow(-30)
    },
    {
      _id: 'demo-log-2',
      meetingId: 'demo-meeting-1',
      type: 'email_sent',
      message: 'Invitation email sent to ava@example.com',
      createdAt: minutesFromNow(-29)
    },
    {
      _id: 'demo-log-3',
      meetingId: 'demo-meeting-2',
      type: 'email_sent',
      message: 'Reminder sent to noah@example.com',
      createdAt: minutesFromNow(-120)
    },
    {
      _id: 'demo-log-4',
      meetingId: 'demo-meeting-3',
      type: 'reminder_sent',
      message: 'Reminder (1440m) sent to mia@example.com',
      createdAt: minutesFromNow(-60)
    },
    {
      _id: 'demo-log-5',
      meetingId: 'demo-meeting-4',
      type: 'calendar_created',
      message: 'Status synced for Weekly Retrospective',
      createdAt: minutesFromNow(-1180)
    },
    {
      _id: 'demo-log-6',
      meetingId: 'demo-meeting-5',
      type: 'meeting_cancelled',
      message: 'Budget Allocation FY25 was cancelled after approval review changes',
      createdAt: minutesFromNow(-890),
      error: 'Approval owner unavailable'
    },
    {
      _id: 'demo-log-7',
      meetingId: 'demo-meeting-6',
      type: 'meeting_cancelled',
      message: 'Infrastructure Weekly Review failed to attach a calendar event',
      createdAt: minutesFromNow(-240),
      error: 'Calendar provider timeout'
    },
    {
      _id: 'demo-log-8',
      type: 'settings_updated',
      message: 'Reminder settings updated for the workspace',
      createdAt: minutesFromNow(-20)
    }
  ]
});

const readDemoData = () => {
  const raw = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) {
    const initial = createInitialDemoData();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const initial = createInitialDemoData();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
};

const writeDemoData = (data) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  return data;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const delay = (value) => new Promise((resolve) => {
  window.setTimeout(() => resolve(clone(value)), 120);
});

const ensureDemoAuth = (token) => {
  if (token !== DEMO_TOKEN) {
    throw new Error('Demo session required');
  }
};

class ApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.canUseDemo = true;
    this.token = localStorage.getItem('meetbot_token');

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.clearToken();
          if (!window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth';
          }
        }
        const message = error.response?.data?.error || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
      }
    );
  }

  isDemoSessionToken(token = this.token) {
    return token === DEMO_TOKEN;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('meetbot_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('meetbot_token');
  }

  async request(endpoint, options = {}) {
    const { method = 'GET', body, params, ...rest } = options;
    return this.client({
      url: endpoint,
      method,
      data: body,
      params,
      ...rest
    });
  }

  async getAuthUrl() {
    const response = await this.request('/auth/google');
    return response.authUrl ?? response.url ?? null;
  }

  async getMe() {
    if (this.isDemoSessionToken()) {
      ensureDemoAuth(this.token);
      return delay(DEMO_USER);
    }

    const response = await this.request('/auth/me');
    return response.user ?? response;
  }

  async loginDemo() {
    this.setToken(DEMO_TOKEN);
    return delay({ user: DEMO_USER, token: DEMO_TOKEN });
  }

  async logout() {
    if (this.isDemoSessionToken()) {
      this.clearToken();
      return delay({ message: 'Logged out successfully' });
    }

    return this.request('/auth/logout', { method: 'POST' });
  }

  async createMeeting(data) {
    if (!this.isDemoSessionToken()) {
      return this.request('/meetings', { method: 'POST', body: data });
    }

    ensureDemoAuth(this.token);
    const store = readDemoData();
    const meetingId = `demo-meeting-${Date.now()}`;
    const reminderMinutes = store.settings.emailReminderMinutes || [1440, 60];
    const now = new Date().toISOString();
    const meeting = {
      _id: meetingId,
      userId: DEMO_USER.userId,
      userEmail: DEMO_USER.email,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      participants: [
        data.recipientName,
        ...(Array.isArray(data.collaborators) ? data.collaborators.slice(0, 3) : []),
      ],
      subject: data.subject,
      message: data.message,
      scheduledAt: data.scheduledAt,
      timezone: data.timezone,
      durationMinutes: data.durationMinutes,
      googleMeetLink: `https://meet.google.com/demo-${meetingId}`,
      status: 'email_sent',
      reminders: [
        ...reminderMinutes.map((minutesBefore) => createReminder(minutesBefore)),
        createReminder(0)
      ],
      createdAt: now,
      updatedAt: now
    };

    store.meetings.unshift(meeting);
    store.logs.unshift({
      _id: `demo-log-${Date.now()}`,
      meetingId,
      type: 'email_sent',
      message: `Demo invite created for ${data.recipientEmail}`,
      createdAt: now
    });
    store.logs.unshift({
      _id: `demo-log-${Date.now()}-calendar`,
      meetingId,
      type: 'calendar_created',
      message: `Demo calendar event created for ${data.subject}`,
      createdAt: now
    });

    writeDemoData(store);
    return delay(meeting);
  }

  async getMeetings(params = {}) {
    if (!this.isDemoSessionToken()) {
      return this.request('/meetings', { params });
    }

    ensureDemoAuth(this.token);
    const { page = 1, limit = 20, status } = params;
    const store = readDemoData();
    let meetings = [...store.meetings].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
    if (status) {
      meetings = meetings.filter((meeting) => meeting.status === status);
    }

    const start = (Number(page) - 1) * Number(limit);
    const paged = meetings.slice(start, start + Number(limit));

    return delay({
      meetings: paged,
      totalPages: Math.max(1, Math.ceil(meetings.length / Number(limit))),
      currentPage: Number(page),
      total: meetings.length
    });
  }

  async getMeeting(id) {
    if (!this.isDemoSessionToken()) {
      return this.request(`/meetings/${id}`);
    }

    ensureDemoAuth(this.token);
    const meeting = readDemoData().meetings.find((item) => item._id === id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    return delay(meeting);
  }

  async getMeetingStats() {
    if (!this.isDemoSessionToken()) {
      return this.request('/meetings/stats/summary');
    }

    ensureDemoAuth(this.token);
    const meetings = readDemoData().meetings;
    const now = new Date();
    const total = meetings.length;
    const completed = meetings.filter((meeting) => meeting.status === 'completed').length;
    const failed = meetings.filter((meeting) => meeting.status === 'failed').length;
    const cancelled = meetings.filter((meeting) => meeting.status === 'cancelled').length;
    const upcoming = meetings.filter((meeting) => new Date(meeting.scheduledAt) > now && !['cancelled', 'failed'].includes(meeting.status)).length;
    const pending = total - completed - failed - cancelled;

    return delay({ total, upcoming, pending, completed, failed, cancelled });
  }

  async cancelMeeting(id, reason) {
    if (!this.isDemoSessionToken()) {
      return this.request(`/meetings/${id}`, { method: 'DELETE', body: { reason } });
    }

    ensureDemoAuth(this.token);
    const store = readDemoData();
    const meeting = store.meetings.find((item) => item._id === id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    meeting.status = 'cancelled';
    meeting.cancelledAt = new Date().toISOString();
    meeting.cancelReason = reason || '';
    meeting.updatedAt = new Date().toISOString();

    store.logs.unshift({
      _id: `demo-log-${Date.now()}-cancel`,
      meetingId: id,
      type: 'meeting_cancelled',
      message: `Demo meeting cancelled${reason ? `: ${reason}` : ''}`,
      createdAt: new Date().toISOString()
    });

    writeDemoData(store);
    return delay(meeting);
  }

  async resendInvite(id) {
    if (!this.isDemoSessionToken()) {
      return this.request(`/meetings/${id}/resend`, { method: 'POST' });
    }

    ensureDemoAuth(this.token);
    const store = readDemoData();
    const meeting = store.meetings.find((item) => item._id === id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    store.logs.unshift({
      _id: `demo-log-${Date.now()}-resend`,
      meetingId: id,
      type: 'email_sent',
      message: `Demo invite resent to ${meeting.recipientEmail}`,
      createdAt: new Date().toISOString()
    });

    writeDemoData(store);
    return delay({ message: 'Invite resent successfully' });
  }

  async getSettings() {
    if (!this.isDemoSessionToken()) {
      return this.request('/settings');
    }

    ensureDemoAuth(this.token);
    return delay(readDemoData().settings);
  }

  async updateSettings(data) {
    if (!this.isDemoSessionToken()) {
      return this.request('/settings', { method: 'PUT', body: data });
    }

    ensureDemoAuth(this.token);
    const store = readDemoData();
    store.settings = {
      ...store.settings,
      ...data
    };

    store.logs.unshift({
      _id: `demo-log-${Date.now()}-settings`,
      type: 'settings_updated',
      message: 'Demo settings updated',
      createdAt: new Date().toISOString()
    });

    writeDemoData(store);
    return delay(store.settings);
  }

  async getLogs(params = {}) {
    if (!this.isDemoSessionToken()) {
      return this.request('/logs', { params });
    }

    ensureDemoAuth(this.token);
    const { page = 1, limit = 50, meetingId, type } = params;
    const store = readDemoData();
    let logs = [...store.logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (meetingId) {
      logs = logs.filter((log) => log.meetingId === meetingId);
    }
    if (type) {
      logs = logs.filter((log) => log.type === type);
    }

    const start = (Number(page) - 1) * Number(limit);
    const paged = logs.slice(start, start + Number(limit));

    return delay({
      logs: paged,
      totalPages: Math.max(1, Math.ceil(logs.length / Number(limit))),
      currentPage: Number(page),
      total: logs.length
    });
  }
}

export const api = new ApiClient();
