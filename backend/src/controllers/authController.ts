import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { signToken, attachCookie, clearCookie } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await registerUser(name, email, password);
    const token = signToken(String(user._id));
    attachCookie(res, token);
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { return next(e); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await loginUser(email, password);
    const token = signToken(String(user._id));
    attachCookie(res, token);
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) { return next(e); }
};

export const logout = (_req: Request, res: Response) => {
  clearCookie(res);
  res.json({ message: 'Logged out' });
};

export const me = (req: AuthRequest, res: Response) => {
  res.json({ user: { id: req.userId, name: req.userName, email: req.userEmail } });
};
