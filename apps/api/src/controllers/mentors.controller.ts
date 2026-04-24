import { Request, Response, NextFunction } from 'express';
import * as mentorsService from '../services/mentors.service.js';

export async function listMentors(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await mentorsService.listMentors(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMentor(req: Request, res: Response, next: NextFunction) {
  try {
    const mentor = await mentorsService.getMentorById(req.params.id);
    res.json({ data: mentor });
  } catch (error) {
    next(error);
  }
}
