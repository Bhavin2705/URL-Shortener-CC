import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.message);
  const message = err.message.toLowerCase();
  const status = message.includes('not found') ? 404
    : message.includes('taken') || message.includes('already registered') ? 409
    : message.includes('expired') ? 410
    : message.includes('not authenticated') || message.includes('invalid credentials') || message.includes('invalid or expired token') ? 401
    : message.includes('unauthorized') || message.includes('access required') || message.includes('blocked') ? 403
    : message.includes('required') || message.includes('invalid') ? 400
    : 500;
  res.status(status).json({ error: err.message });
};
