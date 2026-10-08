import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { prisma } from '../lib/prisma.js';
import {
  getAuthUrl,
  getTokensFromCode,
  isGoogleCalendarConfigured,
} from '../lib/google-calendar.js';
import { AppError } from '../utils/errors.js';

export const calendarRouter = Router();

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.CORS_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:3000';

/**
 * @openapi
 * /calendar/connect:
 *   get:
 *     summary: Start Google Calendar OAuth flow
 *     description: Redirects the mentor to Google's OAuth consent screen
 *     tags: [Calendar]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *       503:
 *         description: Google Calendar not configured
 */
calendarRouter.get('/connect', authenticate, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isGoogleCalendarConfigured()) {
      throw new AppError('Google Calendar integration is not configured', 503);
    }
    const url = getAuthUrl(req.user.id);
    res.redirect(url);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /calendar/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the redirect from Google after user grants calendar access
 *     tags: [Calendar]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID passed through OAuth state
 *     responses:
 *       302:
 *         description: Redirect to frontend profile page
 *       400:
 *         description: Missing code or state parameter
 */
calendarRouter.get('/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId || typeof code !== 'string' || typeof userId !== 'string') {
      throw new AppError('Missing code or state parameter', 400);
    }

    // Verify the userId exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Invalid state parameter', 400);
    }

    const tokens = await getTokensFromCode(code);

    if (!tokens.refreshToken) {
      // User may have already granted access before — redirect with error
      res.redirect(`${FRONTEND_URL}/profile?calendar=error&reason=no_refresh_token`);
      return;
    }

    // Store refresh token and email on user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: tokens.refreshToken,
        googleCalendarEmail: tokens.email || undefined,
      },
    });

    res.redirect(`${FRONTEND_URL}/profile?calendar=connected`);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /calendar/disconnect:
 *   delete:
 *     summary: Disconnect Google Calendar
 *     description: Removes stored Google Calendar credentials
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Calendar disconnected
 */
calendarRouter.delete('/disconnect', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        googleRefreshToken: null,
        googleCalendarEmail: null,
      },
    });

    res.json({ data: null, message: 'Google Calendar disconnected' });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /calendar/status:
 *   get:
 *     summary: Check Google Calendar connection status
 *     tags: [Calendar]
 *     responses:
 *       200:
 *         description: Calendar connection status
 */
calendarRouter.get('/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleCalendarEmail: true, googleRefreshToken: true },
    });

    res.json({
      data: {
        connected: !!user?.googleRefreshToken,
        email: user?.googleCalendarEmail || null,
        configured: isGoogleCalendarConfigured(),
      },
    });
  } catch (error) {
    next(error);
  }
});
