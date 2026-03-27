import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './auth.js';
import { sendError } from './utils.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    sendError(response, 401, 'Authentication required.');
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    sendError(response, 401, 'Session expired. Please sign in again.');
    return;
  }

  request.auth = {
    userId: payload.userId,
    email: payload.email,
  };

  next();
}
