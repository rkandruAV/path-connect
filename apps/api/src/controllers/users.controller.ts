import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service.js';

export async function createOrUpdateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.createOrUpdateUser(req.user.id, req.body);
    res.status(200).json({ data: user, message: 'User profile updated' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserWithProfile(req.user.id);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(req.user.id, req.body);
    res.json({ data: user, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
}
