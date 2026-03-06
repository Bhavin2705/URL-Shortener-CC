import { Response, NextFunction } from 'express';
import User from '../models/User';
import Url from '../models/Url';
import ClickEvent from '../models/ClickEvent';
import { AuthRequest } from '../middleware/auth';

export const adminOverview = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [users, admins, links] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Url.countDocuments(),
    ]);
    return res.json({ users, admins, links });
  } catch (e) { return next(e); }
};

export const listUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select('_id name email role isBlocked blockedAt createdAt').sort({ createdAt: -1 });
    return res.json(users);
  } catch (e) { return next(e); }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body as { role?: 'user' | 'admin' };
    if (role !== 'user' && role !== 'admin') return res.status(400).json({ error: 'Invalid role' });
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }
    const existing = await User.findById(req.params.id).select('_id role');
    if (!existing) return res.status(404).json({ error: 'User not found' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (role === 'admin' && existing.role !== 'admin' && adminCount >= 1) {
      return res.status(400).json({ error: 'Only one admin is allowed' });
    }
    if (existing.role === 'admin' && role === 'user') {
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'At least one admin is required' });
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('_id name email role isBlocked blockedAt createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (e) { return next(e); }
};

export const setUserBlocked = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { blocked } = req.body as { blocked?: boolean };
    if (typeof blocked !== 'boolean') return res.status(400).json({ error: 'blocked must be boolean' });
    if (req.params.id === req.userId) return res.status(400).json({ error: 'You cannot block yourself' });
    const user = await User.findById(req.params.id).select('_id role');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Admin cannot be blocked' });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: blocked, blockedAt: blocked ? new Date() : null },
      { new: true },
    ).select('_id name email role isBlocked blockedAt createdAt');
    return res.json(updated);
  } catch (e) { return next(e); }
};

export const adminAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const [
      totalUsers,
      blockedUsers,
      totalLinks,
      phishyLinks,
      recentClicks,
      recentPhishyClicks,
      totalClicksAgg,
      dailyUsage,
      flaggedLinks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      Url.countDocuments(),
      Url.countDocuments({ isPhishy: true }),
      ClickEvent.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ClickEvent.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isPhishy: true }),
      Url.aggregate([{ $group: { _id: null, clicks: { $sum: '$clicks' } } }]),
      ClickEvent.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            clicks: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Url.find({ isPhishy: true })
        .sort({ clicks: -1, createdAt: -1 })
        .limit(25)
        .select('shortCode title clicks isPhishy phishyReasons createdAt'),
    ]);

    const phishyEvents = await ClickEvent.find({ isPhishy: true })
      .sort({ createdAt: -1 })
      .limit(25)
      .select('createdAt shortCode originalUrl owner ip referrer')
      .populate('owner', 'name email role');

    return res.json({
      totals: {
        totalUsers,
        blockedUsers,
        totalLinks,
        phishyLinks,
        totalClicks: totalClicksAgg[0]?.clicks ?? 0,
        clicksLast7Days: recentClicks,
        phishyClicksLast7Days: recentPhishyClicks,
      },
      dailyUsage,
      flaggedLinks,
      phishyEvents,
    });
  } catch (e) { return next(e); }
};
