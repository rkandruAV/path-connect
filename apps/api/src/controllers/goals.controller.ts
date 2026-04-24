import { Request, Response, NextFunction } from 'express';
import * as goalsService from '../services/goals.service.js';

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await goalsService.createGoal(req.user.id, req.body);
    res.status(201).json({ data: goal, message: 'Goal created' });
  } catch (error) {
    next(error);
  }
}

export async function listGoals(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await goalsService.listGoals(req.user.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await goalsService.updateGoal(req.params.id, req.user.id, req.body);
    res.json({ data: goal, message: 'Goal updated' });
  } catch (error) {
    next(error);
  }
}
