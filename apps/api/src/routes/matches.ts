import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createMatchSchema, updateMatchSchema, listMatchesQuerySchema, matchIdParamsSchema } from '../validators/matches.validator.js';
import * as matchesController from '../controllers/matches.controller.js';

export const matchesRouter = Router();

matchesRouter.use(authenticate);

matchesRouter.post('/', validate({ body: createMatchSchema }), matchesController.createMatch);
matchesRouter.get('/', validate({ query: listMatchesQuerySchema }), matchesController.listMatches);
matchesRouter.patch('/:id', validate({ params: matchIdParamsSchema, body: updateMatchSchema }), matchesController.updateMatch);
