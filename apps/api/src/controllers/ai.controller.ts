import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service.js';

export async function matchMentors(req: Request, res: Response, next: NextFunction) {
  try {
    const matches = await aiService.matchMentors(req.user.id, req.body);
    res.json({ data: matches, message: 'Mentor matches generated' });
  } catch (error) {
    next(error);
  }
}

export async function summarizeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await aiService.summarizeSession(req.params.id, req.user.id);
    res.json({ data: summary, message: 'Session summarized' });
  } catch (error) {
    next(error);
  }
}

export async function getLearningPath(req: Request, res: Response, next: NextFunction) {
  try {
    const goals = await aiService.generateLearningPath(req.user.id);
    res.json({ data: goals });
  } catch (error) {
    next(error);
  }
}

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await aiService.chatWithAdvisor(req.user.id, req.body);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}
