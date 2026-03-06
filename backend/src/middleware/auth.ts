import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.snip_token;
  if (!token) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('_id name email');
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }
    req.userId = String(user._id);
    req.userName = user.name;
    req.userEmail = user.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
