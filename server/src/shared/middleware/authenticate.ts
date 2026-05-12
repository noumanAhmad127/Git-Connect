import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { verifyAccessToken } from '../../modules/auth/auth.service.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const payload = verifyAccessToken(token);
  req.userId = payload.userId;
  next();
}
