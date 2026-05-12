import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken =
    typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;
  const token = cookies?.session_token ?? bearerToken;

  if (!token) {
    throw new UnauthorizedError();
  }

  // Better Auth session validation will be added here
  next();
}
