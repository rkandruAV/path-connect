import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createGoalSchema, updateGoalSchema, listGoalsQuerySchema, goalIdParamsSchema } from '../validators/goals.validator.js';
import * as goalsController from '../controllers/goals.controller.js';

export const goalsRouter = Router();

goalsRouter.use(authenticate);

goalsRouter.post('/', validate({ body: createGoalSchema }), goalsController.createGoal);
goalsRouter.get('/', validate({ query: listGoalsQuerySchema }), goalsController.listGoals);
goalsRouter.patch('/:id', validate({ params: goalIdParamsSchema, body: updateGoalSchema }), goalsController.updateGoal);
