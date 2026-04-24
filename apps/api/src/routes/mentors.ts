import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { listMentorsQuerySchema, mentorIdParamsSchema } from '../validators/mentors.validator.js';
import * as mentorsController from '../controllers/mentors.controller.js';

export const mentorsRouter = Router();

mentorsRouter.use(authenticate);

mentorsRouter.get('/', validate({ query: listMentorsQuerySchema }), mentorsController.listMentors);
mentorsRouter.get('/:id', validate({ params: mentorIdParamsSchema }), mentorsController.getMentor);
