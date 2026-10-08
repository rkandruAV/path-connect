import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { listMentorsQuerySchema, mentorIdParamsSchema } from '../validators/mentors.validator.js';
import * as mentorsController from '../controllers/mentors.controller.js';
import { prisma } from '../lib/prisma.js';
import { getFreeBusy, isGoogleCalendarConfigured } from '../lib/google-calendar.js';
import { AppError } from '../utils/errors.js';

export const mentorsRouter = Router();

mentorsRouter.use(authenticate);

/**
 * @openapi
 * /mentors:
 *   get:
 *     summary: List mentors
 *     tags: [Mentors]
 *     parameters:
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by area of expertise
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Paginated list of mentors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MentorWithUser'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
mentorsRouter.get('/', validate({ query: listMentorsQuerySchema }), mentorsController.listMentors);

/**
 * @openapi
 * /mentors/{id}:
 *   get:
 *     summary: Get mentor by ID
 *     tags: [Mentors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Mentor profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MentorWithUser'
 *       404:
 *         description: Mentor not found
 */
mentorsRouter.get('/:id', validate({ params: mentorIdParamsSchema }), mentorsController.getMentor);

/**
 * @openapi
 * /mentors/{id}/availability:
 *   get:
 *     summary: Get mentor's available time slots
 *     description: Queries the mentor's Google Calendar for free/busy data and returns available slots
 *     tags: [Mentors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to check availability (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     calendarConnected:
 *                       type: boolean
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start:
 *                             type: string
 *                             format: date-time
 *                           end:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Mentor not found
 */
mentorsRouter.get('/:id/availability', validate({ params: mentorIdParamsSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: mentorProfileId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      throw new AppError('date query parameter is required (YYYY-MM-DD)', 400);
    }

    // Find the mentor's user record via their profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
      include: {
        user: {
          select: { googleRefreshToken: true },
        },
      },
    });

    if (!mentorProfile) {
      throw new AppError('Mentor not found', 404);
    }

    if (!mentorProfile.user.googleRefreshToken || !isGoogleCalendarConfigured()) {
      res.json({
        data: {
          calendarConnected: false,
          date,
          slots: [],
        },
      });
      return;
    }

    // Query free/busy for the given date (9am to 6pm UTC)
    const dayStart = `${date}T09:00:00Z`;
    const dayEnd = `${date}T18:00:00Z`;

    const busySlots = await getFreeBusy(mentorProfile.user.googleRefreshToken, dayStart, dayEnd);

    // Invert busy slots to get available slots (minimum 30-min blocks)
    const MIN_SLOT_MINUTES = 30;
    const availableSlots: { start: string; end: string }[] = [];
    let currentStart = new Date(dayStart);
    const dayEndDate = new Date(dayEnd);

    for (const busy of busySlots) {
      const busyStart = new Date(busy.start);
      if (busyStart > currentStart) {
        const gapMinutes = (busyStart.getTime() - currentStart.getTime()) / 60000;
        if (gapMinutes >= MIN_SLOT_MINUTES) {
          availableSlots.push({
            start: currentStart.toISOString(),
            end: busyStart.toISOString(),
          });
        }
      }
      const busyEnd = new Date(busy.end);
      if (busyEnd > currentStart) {
        currentStart = busyEnd;
      }
    }

    // Add remaining time after last busy slot
    if (currentStart < dayEndDate) {
      const gapMinutes = (dayEndDate.getTime() - currentStart.getTime()) / 60000;
      if (gapMinutes >= MIN_SLOT_MINUTES) {
        availableSlots.push({
          start: currentStart.toISOString(),
          end: dayEndDate.toISOString(),
        });
      }
    }

    res.json({
      data: {
        calendarConnected: true,
        date,
        slots: availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
});
