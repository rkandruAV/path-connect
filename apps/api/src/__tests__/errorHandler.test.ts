import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { errorHandler } from '../middleware/errorHandler.js';
import { AppError, NotFoundError, ForbiddenError } from '../utils/errors.js';

function createApp(error: Error) {
  const app = express();
  app.get('/test', () => { throw error; });
  app.use(errorHandler);
  return app;
}

describe('errorHandler middleware', () => {
  it('returns 404 for NotFoundError', async () => {
    const app = createApp(new NotFoundError('User', 'abc123'));
    const res = await request(app).get('/test');

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('User');
    expect(res.body.message).toContain('abc123');
    expect(res.body.data).toBeNull();
  });

  it('returns 403 for ForbiddenError', async () => {
    const app = createApp(new ForbiddenError());
    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.data).toBeNull();
  });

  it('returns custom status for AppError', async () => {
    const app = createApp(new AppError('Rate limited', 429));
    const res = await request(app).get('/test');

    expect(res.status).toBe(429);
    expect(res.body.message).toBe('Rate limited');
  });

  it('returns validation details when present', async () => {
    const details = [{ field: 'email', message: 'Required' }];
    const app = createApp(new AppError('Validation failed', 400, details));
    const res = await request(app).get('/test');

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(details);
  });

  it('returns 500 for unexpected errors', async () => {
    const app = createApp(new Error('Something broke'));
    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body.data).toBeNull();
  });
});
