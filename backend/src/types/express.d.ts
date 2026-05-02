import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & {
        sid?: string;
        sub?: string;
        email?: string;
      };
    }
  }
}

export {};