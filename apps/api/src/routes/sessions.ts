import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createSessionSchema, sessionNotesSchema, listSessionsQuerySchema, sessionIdParamsSchema } from '../validators/sessions.validator.js';
import * as sessionsController from '../controllers/sessions.controller.js';

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);

/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: Create a mentoring session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, scheduledAt, duration]
 *             properties:
 *               matchId:
 *                 type: string
 *                 format: uuid
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 180
 *                 description: Duration in minutes
 *               type:
 *                 type: string
 *                 enum: [VIDEO, AUDIO, IN_PERSON]
 *                 default: VIDEO
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *                 message:
 *                   type: string
 */
sessionsRouter.post('/', validate({ body: createSessionSchema }), sessionsController.createSession);

/**
 * @openapi
 * /sessions:
 *   get:
 *     summary: List sessions for current user
 *     tags: [Sessions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED]
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
 *         description: Paginated list of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
sessionsRouter.get('/', validate({ query: listSessionsQuerySchema }), sessionsController.listSessions);

/**
 * @openapi
 * /sessions/{id}:
 *   get:
 *     summary: Get session details
 *     description: Returns session with summary, action items, and notes
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SessionDetail'
 *       404:
 *         description: Session not found
 */
sessionsRouter.get('/:id', validate({ params: sessionIdParamsSchema }), sessionsController.getSession);

/**
 * @openapi
 * /sessions/{id}/notes:
 *   post:
 *     summary: Add or update personal notes for a session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10000
 *     responses:
 *       200:
 *         description: Note saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SessionNote'
 *                 message:
 *                   type: string
 */
sessionsRouter.post('/:id/notes', validate({ params: sessionIdParamsSchema, body: sessionNotesSchema }), sessionsController.upsertNotes);
