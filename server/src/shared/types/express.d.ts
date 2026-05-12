import type { User } from '@gitconnect/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}
