import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { authenticate } from '../middleware/authenticate.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Mock prisma
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock firebase-admin (dynamically imported in authenticate)
vi.mock('../lib/firebase-admin.js', () => ({
  firebaseAuth: {
    verifyIdToken: vi.fn(),
  },
}));

import { prisma } from '../lib/prisma.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.get('/test', authenticate, (req, res) => {
    res.json({ userId: req.user?.id, role: req.user?.role });
  });
  app.use(errorHandler);
  return app;
}

const mockUser = {
  id: 'user-1',
  firebaseUid: 'firebase-123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'MENTEE',
  photoUrl: null,
};

describe('authenticate middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env
    process.env.NODE_ENV = 'test';
    delete process.env.DEV_BYPASS_AUTH;
  });

  describe('production mode (Firebase auth)', () => {
    it('returns 401 when no Authorization header is provided', async () => {
      const app = createApp();
      const res = await request(app).get('/test');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Authorization');
    });

    it('returns 401 when Authorization header is not Bearer', async () => {
      const app = createApp();
      const res = await request(app)
        .get('/test')
        .set('Authorization', 'Basic abc123');

      expect(res.status).toBe(401);
    });

    it('authenticates with valid Firebase token and existing user', async () => {
      const { firebaseAuth } = await import('../lib/firebase-admin.js');
      vi.mocked(firebaseAuth.verifyIdToken).mockResolvedValue({
        uid: 'firebase-123',
        email: 'test@example.com',
        name: 'Test User',
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const app = createApp();
      const res = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('user-1');
      expect(res.body.role).toBe('MENTEE');
    });

    it('auto-creates user on first Firebase login', async () => {
      const { firebaseAuth } = await import('../lib/firebase-admin.js');
      vi.mocked(firebaseAuth.verifyIdToken).mockResolvedValue({
        uid: 'new-firebase-uid',
        email: 'new@example.com',
        name: 'New User',
        picture: 'https://example.com/photo.jpg',
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const newUser = {
        id: 'user-new',
        firebaseUid: 'new-firebase-uid',
        email: 'new@example.com',
        displayName: 'New User',
        photoUrl: 'https://example.com/photo.jpg',
        role: 'MENTEE',
      };
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as any);

      const app = createApp();
      const res = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firebaseUid: 'new-firebase-uid',
          email: 'new@example.com',
          displayName: 'New User',
          photoUrl: 'https://example.com/photo.jpg',
        },
      });
    });

    it('returns 401 when Firebase token verification fails', async () => {
      const { firebaseAuth } = await import('../lib/firebase-admin.js');
      vi.mocked(firebaseAuth.verifyIdToken).mockRejectedValue(new Error('Token expired'));

      const app = createApp();
      const res = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer expired-token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication failed');
    });
  });

  describe('dev bypass mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.DEV_BYPASS_AUTH = 'true';
    });

    it('authenticates with x-dev-user-id header', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const app = createApp();
      const res = await request(app)
        .get('/test')
        .set('x-dev-user-id', 'user-1');

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('user-1');
    });

    it('falls back to first MENTEE when no dev header provided', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as any);

      const app = createApp();
      const res = await request(app).get('/test');

      expect(res.status).toBe(200);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { role: 'MENTEE' } });
    });

    it('falls through to Firebase auth when no users exist in DB', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const app = createApp();
      const res = await request(app).get('/test');

      // No Bearer token → 401
      expect(res.status).toBe(401);
    });
  });
});
