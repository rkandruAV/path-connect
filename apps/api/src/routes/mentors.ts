import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { listMentorsQuerySchema, mentorIdParamsSchema } from '../validators/mentors.validator.js';
import * as mentorsController from '../controllers/mentors.controller.js';

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
