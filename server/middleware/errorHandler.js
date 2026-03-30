import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate resource found' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Google API errors
  if (err.code >= 400 && err.code < 500) {
    return res.status(err.code).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
};
