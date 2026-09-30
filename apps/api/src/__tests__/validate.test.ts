import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { errorHandler } from '../middleware/errorHandler.js';

function createApp(schemas: Parameters<typeof validate>[0]) {
  const app = express();
  app.use(express.json());
  app.post('/test/:id?', validate(schemas), (req, res) => {
    res.json({ body: req.body, query: req.query, params: req.params });
  });
  app.use(errorHandler);
  return app;
}

describe('validate middleware', () => {
  describe('body validation', () => {
    const schema = {
      body: z.object({
        message: z.string().min(1).max(100),
        count: z.number().int().optional(),
      }),
    };

    it('passes valid body through', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test')
        .send({ message: 'hello', count: 5 });

      expect(res.status).toBe(200);
      expect(res.body.body).toEqual({ message: 'hello', count: 5 });
    });

    it('strips extra fields from body', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test')
        .send({ message: 'hello', extra: 'should be stripped' });

      expect(res.status).toBe(200);
      expect(res.body.body).not.toHaveProperty('extra');
    });

    it('returns 400 for missing required field', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test')
        .send({ count: 5 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'message' }),
        ])
      );
    });

    it('returns 400 for invalid type', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test')
        .send({ message: 123 });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('message');
    });

    it('returns 400 when string exceeds max length', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test')
        .send({ message: 'a'.repeat(101) });

      expect(res.status).toBe(400);
    });
  });

  describe('query validation', () => {
    const schema = {
      query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      }),
    };

    it('coerces query string numbers', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test?page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.query).toEqual({ page: 2, limit: 10 });
    });

    it('returns 400 for invalid query value', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test?page=0');

      expect(res.status).toBe(400);
    });
  });

  describe('params validation', () => {
    const schema = {
      params: z.object({
        id: z.string().min(1),
      }),
    };

    it('passes valid params through', async () => {
      const app = createApp(schema);
      const res = await request(app)
        .post('/test/abc123');

      expect(res.status).toBe(200);
      expect(res.body.params.id).toBe('abc123');
    });
  });

  describe('AI validator schemas', () => {
    it('validates chat message with min/max length', async () => {
      const schema = {
        body: z.object({
          message: z.string().min(1).max(2000),
          conversationId: z.string().optional(),
        }),
      };

      const app = createApp(schema);

      // Empty message should fail
      const res1 = await request(app).post('/test').send({ message: '' });
      expect(res1.status).toBe(400);

      // Valid message should pass
      const res2 = await request(app).post('/test').send({ message: 'Hello AI' });
      expect(res2.status).toBe(200);

      // Message over 2000 chars should fail
      const res3 = await request(app).post('/test').send({ message: 'x'.repeat(2001) });
      expect(res3.status).toBe(400);
    });
  });
});
