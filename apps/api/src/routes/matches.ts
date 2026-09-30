import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createMatchSchema, updateMatchSchema, listMatchesQuerySchema, matchIdParamsSchema } from '../validators/matches.validator.js';
import * as matchesController from '../controllers/matches.controller.js';

export const matchesRouter = Router();

matchesRouter.use(authenticate);

/**
 * @openapi
 * /matches:
 *   post:
 *     summary: Create a mentor-mentee match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mentorId]
 *             properties:
 *               mentorId:
 *                 type: string
 *                 format: uuid
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Match created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *                 message:
 *                   type: string
 *       409:
 *         description: Duplicate active/pending match
 */
matchesRouter.post('/', validate({ body: createMatchSchema }), matchesController.createMatch);

/**
 * @openapi
 * /matches:
 *   get:
 *     summary: List matches for current user
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACTIVE, COMPLETED, DECLINED]
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
 *         description: Paginated list of matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
matchesRouter.get('/', validate({ query: listMatchesQuerySchema }), matchesController.listMatches);

/**
 * @openapi
 * /matches/{id}:
 *   patch:
 *     summary: Update match status
 *     tags: [Matches]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DECLINED, COMPLETED]
 *     responses:
 *       200:
 *         description: Match updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *                 message:
 *                   type: string
 *       403:
 *         description: Not authorized to update this match
 *       404:
 *         description: Match not found
 */
matchesRouter.patch('/:id', validate({ params: matchIdParamsSchema, body: updateMatchSchema }), matchesController.updateMatch);
