import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../lib/sentry.js';
import { AppError } from '../utils/errors.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  };

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error(JSON.stringify({ ...logEntry, statusCode: err.statusCode, level: 'error' }));
      Sentry.captureException(err);
    }
    const response: Record<string, unknown> = {
      data: null,
      message: err.message,
    };
    if (err.details) {
      response.errors = err.details;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  // Unexpected errors — always log and report to Sentry
  console.error(JSON.stringify({ ...logEntry, level: 'error', type: 'unhandled' }));
  Sentry.captureException(err);
  res.status(500).json({
    data: null,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}
