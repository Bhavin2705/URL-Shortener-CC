import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getUserUrlStats } from '../services/urlService';

export const stats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = await getUserUrlStats(req.params.code, req.userId!);
    const base = process.env.BASE_URL || 'http://localhost:5000';
    return res.json({ ...url.toObject(), shortUrl: `${base}/${url.shortCode}` });
  } catch (e) { return next(e); }
};
