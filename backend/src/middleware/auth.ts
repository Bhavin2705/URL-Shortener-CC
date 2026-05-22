import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: 'user' | 'admin';
  userBlocked?: boolean;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.snip_token;
  if (!token) { res.status(401).json({ error: 'Not authenticated' }); return; }
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('_id name email role isBlocked');
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }
    if (user.isBlocked) {
      res.status(403).json({ error: 'Account is blocked' });
      return;
    }
    req.userId = String(user._id);
    req.userName = user.name;
    req.userEmail = user.email;
    req.userRole = user.role;
    req.userBlocked = user.isBlocked;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.snip_token;
  if (!token) { next(); return; }
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('_id name email role isBlocked');
    if (!user) { next(); return; }
    if (user.isBlocked) { next(); return; }
    req.userId = String(user._id);
    req.userName = user.name;
    req.userEmail = user.email;
    req.userRole = user.role;
    req.userBlocked = user.isBlocked;
    next();
  } catch {
    next();
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
