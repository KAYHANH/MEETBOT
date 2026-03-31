import { google } from 'googleapis';
import { logger } from '../utils/logger.js';
import * as tokenStore from '../utils/tokenStore.js';

const isPlaceholder = (value = '') =>
  /your_google_client|replace_with|example/i.test(value);

const getGoogleOAuthConfig = () => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error = new Error(`Missing Google OAuth configuration: ${missing.join(', ')}`);
    error.status = 500;
    throw error;
  }

  const invalid = required.filter((key) => isPlaceholder(process.env[key]));
  if (invalid.length > 0) {
    const error = new Error(
      'Google sign-in is disabled in this demo build. Use View Demo or add real Google OAuth values to .env.',
    );
    error.status = 503;
    throw error;
  }

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  };
};

export const createOAuth2Client = () => {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });
};

export const getTokensFromCode = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const getAuthenticatedClient = async (userId) => {
  const tokens = await tokenStore.getTokens(userId);
  if (!tokens || !tokens.access_token) {
    throw new Error('No Google tokens found for user');
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  oauth2Client.on('tokens', (newTokens) => {
    logger.info(`Refreshing tokens for user ${userId}`);
    tokenStore.storeTokens(userId, {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokens.refresh_token,
      expiryDate: new Date(newTokens.expiry_date)
    });
  });

  return oauth2Client;
};

export const getUserInfo = async (accessToken) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data;
};

// Gmail
export const sendEmail = async ({ userId, to, subject, htmlBody }) => {
  try {
    const auth = await getAuthenticatedClient(userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      htmlBody,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    return res.data.id;
  } catch (error) {
    logger.error(`Gmail send error for user ${userId}:`, error);
    throw error;
  }
};

// Calendar
export const createCalendarEvent = async ({ userId, summary, description, startTime, endTime, attendees, timezone }) => {
  try {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary,
      description,
      start: { dateTime: startTime, timeZone: timezone },
      end: { dateTime: endTime, timeZone: timezone },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meetbot-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    const meetLink = res.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

    return {
      eventId: res.data.id,
      meetLink: meetLink || null,
      htmlLink: res.data.htmlLink
    };
  } catch (error) {
    logger.error(`Calendar create error for user ${userId}:`, error);
    throw error;
  }
};

export const deleteCalendarEvent = async (userId, eventId) => {
  try {
    const auth = await getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  } catch (error) {
    logger.error(`Calendar delete error for user ${userId}:`, error);
    // Don't throw if already deleted
    if (error.code !== 410 && error.code !== 404) throw error;
  }
};
