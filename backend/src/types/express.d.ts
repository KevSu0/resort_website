import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      // Add custom request properties here
      user?: {
        id: string;
        email: string;
        role: string;
        resortId?: string;
      };

      // Database transaction
      tx?: any;

      // Request metadata
      startTime?: number;
      requestId?: string;
    }
  }
}

export {};