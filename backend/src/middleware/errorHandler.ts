import { Request, Response, NextFunction } from 'express';
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.message);
  const status = err.message.includes('not found') ? 404
    : err.message.includes('taken') ? 409
    : err.message.includes('expired') ? 410
    : err.message.includes('Unauthorized') ? 403
    : 500;
  res.status(status).json({ error: err.message });
};
