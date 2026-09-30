import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createGoalSchema, updateGoalSchema, listGoalsQuerySchema, goalIdParamsSchema } from '../validators/goals.validator.js';
import * as goalsController from '../controllers/goals.controller.js';

export const goalsRouter = Router();

goalsRouter.use(authenticate);

/**
 * @openapi
 * /goals:
 *   post:
 *     summary: Create a goal
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, period]
 *             properties:
 *               planId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               period:
 *                 type: string
 *                 enum: [THIRTY_DAY, SIXTY_DAY, NINETY_DAY]
 *               isAiSuggested:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Goal created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *                 message:
 *                   type: string
 */
goalsRouter.post('/', validate({ body: createGoalSchema }), goalsController.createGoal);

/**
 * @openapi
 * /goals:
 *   get:
 *     summary: List goals for current user
 *     tags: [Goals]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [THIRTY_DAY, SIXTY_DAY, NINETY_DAY]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ON_TRACK, ACHIEVED, NEEDS_UPDATE]
 *       - in: query
 *         name: planId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Paginated list of goals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
goalsRouter.get('/', validate({ query: listGoalsQuerySchema }), goalsController.listGoals);

/**
 * @openapi
 * /goals/{id}:
 *   patch:
 *     summary: Update a goal
 *     tags: [Goals]
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               status:
 *                 type: string
 *                 enum: [PENDING, ON_TRACK, ACHIEVED, NEEDS_UPDATE]
 *     responses:
 *       200:
 *         description: Goal updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *                 message:
 *                   type: string
 *       404:
 *         description: Goal not found
 */
goalsRouter.patch('/:id', validate({ params: goalIdParamsSchema, body: updateGoalSchema }), goalsController.updateGoal);
