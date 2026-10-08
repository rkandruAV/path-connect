import { google, calendar_v3 } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/v1/calendar/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

function createOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google Calendar not configured: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  }
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

/**
 * Generate the Google OAuth consent URL.
 * Pass userId in the `state` param so the callback can associate tokens with the user.
 */
export function getAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: userId,
  });
}

/**
 * Exchange an authorization code for tokens.
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  // Get user's email from the token
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    refreshToken: tokens.refresh_token,
    email: data.email,
  };
}

/**
 * Create an authenticated Calendar client from a stored refresh token.
 */
function getCalendarClient(refreshToken: string): calendar_v3.Calendar {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Query Google Calendar free/busy for a time range.
 * Returns array of busy time ranges.
 */
export async function getFreeBusy(
  refreshToken: string,
  timeMin: string,
  timeMax: string,
): Promise<{ start: string; end: string }[]> {
  const calendar = getCalendarClient(refreshToken);
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: 'primary' }],
    },
  });

  const busy = response.data.calendars?.primary?.busy || [];
  return busy
    .filter((slot): slot is { start: string; end: string } => !!slot.start && !!slot.end)
    .map((slot) => ({ start: slot.start!, end: slot.end! }));
}

/**
 * Create a Google Calendar event with a Google Meet link.
 * Returns the event ID and Meet link.
 */
export async function createEventWithMeet(
  refreshToken: string,
  event: {
    summary: string;
    startTime: string;
    endTime: string;
    attendeeEmail: string;
    description?: string;
  },
): Promise<{ eventId: string; meetLink: string }> {
  const calendar = getCalendarClient(refreshToken);
  const response = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
      summary: event.summary,
      description: event.description || 'PathConnect mentoring session',
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime },
      attendees: [{ email: event.attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `pathconnect-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  return {
    eventId: response.data.id || '',
    meetLink: response.data.hangoutLink || '',
  };
}

/**
 * Delete a Google Calendar event (e.g., when a session is cancelled).
 */
export async function deleteCalendarEvent(
  refreshToken: string,
  eventId: string,
): Promise<void> {
  const calendar = getCalendarClient(refreshToken);
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
  });
}

/**
 * Check if Google Calendar integration is configured.
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET;
}
