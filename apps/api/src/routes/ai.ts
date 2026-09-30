import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { matchMentorsSchema, chatMessageSchema, sessionIdParamsSchema } from '../validators/ai.validator.js';
import * as aiController from '../controllers/ai.controller.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

/**
 * @openapi
 * /ai/match-mentors:
 *   post:
 *     summary: AI-powered mentor matching
 *     description: Uses Dify AI to analyze mentee profile and recommend best-fit mentors
 *     tags: [AI]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetRole:
 *                 type: string
 *                 maxLength: 200
 *               currentPosition:
 *                 type: string
 *                 maxLength: 200
 *               goals:
 *                 type: string
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Matched mentors with AI-generated reasoning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *                 message:
 *                   type: string
 *       503:
 *         description: AI service not configured
 */
aiRouter.post('/match-mentors', validate({ body: matchMentorsSchema }), aiController.matchMentors);

/**
 * @openapi
 * /ai/chat:
 *   post:
 *     summary: Chat with AI career advisor
 *     description: Multi-turn conversation with Dify-powered career advisor chatbot
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *               conversationId:
 *                 type: string
 *                 description: Include to continue an existing conversation
 *     responses:
 *       200:
 *         description: AI advisor response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     answer:
 *                       type: string
 *                     conversationId:
 *                       type: string
 *       503:
 *         description: AI service not configured
 */
aiRouter.post('/chat', validate({ body: chatMessageSchema }), aiController.chat);

/**
 * @openapi
 * /ai/learning-path:
 *   get:
 *     summary: Generate AI learning path
 *     description: Uses Dify AI to generate a personalized 90-day learning path based on user profile
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Generated learning path goals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       period:
 *                         type: string
 *                       description:
 *                         type: string
 *       503:
 *         description: AI service not configured
 */
aiRouter.get('/learning-path', aiController.getLearningPath);

/**
 * @openapi
 * /ai/sessions/{id}/summarize:
 *   post:
 *     summary: AI-summarize a session
 *     description: Uses Dify AI to generate a session summary with key topics, insights, and action items
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session summary with action items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SessionSummary'
 *                 message:
 *                   type: string
 *       404:
 *         description: Session not found
 *       503:
 *         description: AI service not configured
 */
aiRouter.post('/sessions/:id/summarize', validate({ params: sessionIdParamsSchema }), aiController.summarizeSession);
