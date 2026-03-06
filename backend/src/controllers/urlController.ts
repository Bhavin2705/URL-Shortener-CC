import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createShortUrl, resolveCode, getUserUrls, deleteUserUrl } from '../services/urlService';

const base = () => process.env.BASE_URL || 'http://localhost:5000';
const withShortUrl = (u: object & { shortCode: string }) => ({ ...u, shortUrl: `${base()}/${(u as { shortCode: string }).shortCode}` });

export const shorten = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, customCode, expiresAt, title } = req.body;
    if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });
    const url = await createShortUrl(originalUrl, req.userId!, customCode, expiresAt ? new Date(expiresAt) : undefined, title);
    return res.status(201).json({ ...url.toObject(), shortUrl: `${base()}/${url.shortCode}` });
  } catch (e) { return next(e); }
};

export const redirect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const url = await resolveCode(req.params.code);
    return res.redirect(url.originalUrl);
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
