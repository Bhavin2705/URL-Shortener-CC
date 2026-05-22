import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { signToken, attachCookie, clearCookie } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Url from '../models/Url';
import ClickEvent from '../models/ClickEvent';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await registerUser(name, email, password);
    const token = signToken(String(user._id));
    attachCookie(res, token);
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { return next(e); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await loginUser(email, password);
    const token = signToken(String(user._id));
    attachCookie(res, token);
    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { return next(e); }
};

export const logout = (_req: Request, res: Response) => {
  clearCookie(res);
  res.json({ message: 'Logged out' });
};

export const me = (req: AuthRequest, res: Response) => {
  res.json({ user: { id: req.userId, name: req.userName, email: req.userEmail, role: req.userRole } });
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      name,
      email,
      currentPassword,
      newPassword,
    } = req.body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      const normalized = email.trim().toLowerCase();
      if (normalized !== user.email) {
        const exists = await User.findOne({ email: normalized, _id: { $ne: user._id } });
        if (exists) return res.status(409).json({ error: 'Email already registered' });
        user.email = normalized;
      }
    }

    if (newPassword !== undefined) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password is required' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      user.password = newPassword;
    }

    await user.save();
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) { return next(e); }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { confirmation, password } = req.body as { confirmation?: string; password?: string };
    if (confirmation !== 'DELETE') return res.status(400).json({ error: 'Confirmation must be DELETE' });
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) return res.status(400).json({ error: 'Cannot delete the only admin account' });
    }

    const urls = await Url.find({ owner: user._id }).select('_id');
    const urlIds = urls.map((u) => u._id);
    if (urlIds.length > 0) {
      await ClickEvent.deleteMany({ url: { $in: urlIds } });
    }
    await ClickEvent.deleteMany({ owner: user._id });
    await Url.deleteMany({ owner: user._id });
    await User.findByIdAndDelete(user._id);
    clearCookie(res);
    return res.json({ message: 'Account deleted' });
  } catch (e) { return next(e); }
};
