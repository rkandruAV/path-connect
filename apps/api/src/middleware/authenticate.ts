import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    // Dev bypass for local development without Firebase
    if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
      const devUserId = req.headers['x-dev-user-id'] as string;
      if (devUserId) {
        const user = await prisma.user.findUnique({ where: { id: devUserId } });
        if (user) {
          req.user = user;
          return next();
        }
      }
      // Fallback: use first user in DB
      const user = await prisma.user.findFirst();
      if (user) {
        req.user = user;
        return next();
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401);
    }

    const token = authHeader.split('Bearer ')[1];

    // Dynamically import firebase-admin to avoid initialization issues in dev bypass mode
    const { firebaseAuth } = await import('../lib/firebase-admin.js');
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Look up or auto-create the database user
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email!,
          displayName: decodedToken.name || null,
          photoUrl: decodedToken.picture || null,
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
}
