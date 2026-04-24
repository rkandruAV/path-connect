import { Request, Response, NextFunction } from 'express';
import * as sessionsService from '../services/sessions.service.js';

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await sessionsService.createSession(req.user.id, req.body);
    res.status(201).json({ data: session, message: 'Session created' });
  } catch (error) {
    next(error);
  }
}

export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await sessionsService.listSessions(req.user.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await sessionsService.getSessionDetail(req.params.id, req.user.id);
    res.json({ data: session });
  } catch (error) {
    next(error);
  }
}

export async function upsertNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await sessionsService.upsertSessionNote(req.params.id, req.user.id, req.body.content);
    res.json({ data: note, message: 'Notes saved' });
  } catch (error) {
    next(error);
  }
}
