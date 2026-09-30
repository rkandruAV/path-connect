import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../validators/users.validator.js';
import * as usersController from '../controllers/users.controller.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create or update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [MENTOR, MENTEE]
 *               currentPosition:
 *                 type: string
 *               targetRole:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *               mentorProfile:
 *                 type: object
 *                 properties:
 *                   expertise:
 *                     type: array
 *                     items:
 *                       type: string
 *                     minItems: 1
 *                     maxItems: 20
 *                   industry:
 *                     type: string
 *                   yearsExperience:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 50
 *                   availability:
 *                     type: array
 *                     items:
 *                       type: string
 *                   bio:
 *                     type: string
 *                     maxLength: 2000
 *     responses:
 *       200:
 *         description: User created or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 */
usersRouter.post('/', validate({ body: createUserSchema }), usersController.createOrUpdateUser);

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
usersRouter.get('/me', usersController.getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 maxLength: 100
 *               currentPosition:
 *                 type: string
 *               targetRole:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *               mentorProfile:
 *                 type: object
 *                 properties:
 *                   expertise:
 *                     type: array
 *                     items:
 *                       type: string
 *                   industry:
 *                     type: string
 *                   yearsExperience:
 *                     type: integer
 *                   availability:
 *                     type: array
 *                     items:
 *                       type: string
 *                   bio:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 */
usersRouter.patch('/me', validate({ body: updateUserSchema }), usersController.updateMe);
