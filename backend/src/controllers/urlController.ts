import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createShortUrl, resolveCode, getUserUrls, deleteUserUrl, updateUserUrl, recordClickEvent } from '../services/urlService';

const base = () => process.env.BASE_URL || 'http://localhost:5000';
const withShortUrl = (u: object & { shortCode: string }) => ({ ...u, shortUrl: `${base()}/${(u as { shortCode: string }).shortCode}` });

export const shorten = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, customCode, expiresAt, title } = req.body;
    if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });
    const url = await createShortUrl(originalUrl, req.userId, customCode, expiresAt ? new Date(expiresAt) : undefined, title);
    return res.status(201).json({ ...url.toObject(), shortUrl: `${base()}/${url.shortCode}` });
  } catch (e) { return next(e); }
};

export const redirect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = await resolveCode(req.params.code);
    let parsed: URL;
    try {
      parsed = new URL(url.originalUrl);
    } catch {
      throw new Error('Invalid redirect URL');
    }
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      throw new Error('Invalid redirect URL');
    }
    try {
      await recordClickEvent(String(url._id), {
        ownerId: url.owner ? String(url.owner) : null,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent') ?? '',
        referrer: req.get('referer') ?? '',
        isPhishy: url.isPhishy,
      });
    } catch (eventErr) {
      console.error('Click event recording failed', eventErr);
    }
    return res.redirect(parsed.toString());
  } catch (e) { return next(e); }
};

export const list = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const urls = await getUserUrls(req.userId!);
    return res.json(urls.map((u) => withShortUrl({ ...u.toObject(), shortCode: u.shortCode })));
  } catch (e) { return next(e); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await deleteUserUrl(req.params.code, req.userId!);
    return res.json({ message: 'Deleted' });
  } catch (e) { return next(e); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, title, expiresAt } = req.body as {
      originalUrl?: string;
      title?: string;
      expiresAt?: string | null;
    };
    if (originalUrl === undefined && title === undefined && expiresAt === undefined) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    const url = await updateUserUrl(req.params.code, req.userId!, {
      originalUrl,
      title,
      expiresAt: expiresAt === undefined ? undefined : (expiresAt ? new Date(expiresAt) : null),
    });
    return res.json({ ...url.toObject(), shortUrl: `${base()}/${url.shortCode}` });
  } catch (e) { return next(e); }
};
