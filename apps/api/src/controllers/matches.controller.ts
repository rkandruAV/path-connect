import { Request, Response, NextFunction } from 'express';
import * as matchesService from '../services/matches.service.js';

export async function createMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const match = await matchesService.createMatch(req.user.id, req.body);
    res.status(201).json({ data: match, message: 'Match created' });
  } catch (error) {
    next(error);
  }
}

export async function listMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await matchesService.listMatches(req.user.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const match = await matchesService.updateMatchStatus(req.params.id, req.user.id, req.body);
    res.json({ data: match, message: 'Match updated' });
  } catch (error) {
    next(error);
  }
}
