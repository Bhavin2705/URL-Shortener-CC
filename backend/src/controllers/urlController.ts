import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createShortUrl, resolveCode, getUserUrls, deleteUserUrl, updateUserUrl, recordClickEvent } from '../services/urlService';

const base = () => process.env.BASE_URL || 'http://localhost:5000';
const withShortUrl = (u: object & { shortCode: string }) => ({ ...u, shortUrl: `${base()}/${(u as { shortCode: string }).shortCode}` });

const parseExpiresAt = (value: unknown): Date | undefined | null => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('Invalid expiration date');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid expiration date');
  if (date.getTime() <= Date.now()) throw new Error('Expiration date must be in the future');
  return date;
};

const redirectErrorPage = (res: Response, status: number, title: string, message: string) => {
  res.status(status).type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080b12;color:#e5e7eb;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{width:min(90vw,520px);text-align:center;padding:40px 24px}
    h1{font-size:32px;margin:0 0 12px}
    p{color:#9ca3af;line-height:1.6;margin:0 0 28px}
    a{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:#6366f1;color:white;text-decoration:none;font-weight:700;padding:12px 18px}
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Go to Snip</a>
  </main>
</body>
</html>`);
};

export const shorten = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { originalUrl, customCode, expiresAt, title } = req.body;
    if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required' });
    const url = await createShortUrl(originalUrl, req.userId, customCode, parseExpiresAt(expiresAt) ?? undefined, title);
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
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Short URL not found';
    const status = message.toLowerCase().includes('expired') ? 410 : message.toLowerCase().includes('invalid') ? 400 : 404;
    return redirectErrorPage(
      res,
      status,
      status === 410 ? 'This link has expired' : 'Short link unavailable',
      status === 410 ? 'The short link exists, but its expiration date has passed.' : 'The short link may be incorrect, deleted, or no longer available.',
    );
  }
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
      expiresAt: parseExpiresAt(expiresAt),
    });
    return res.json({ ...url.toObject(), shortUrl: `${base()}/${url.shortCode}` });
  } catch (e) { return next(e); }
};
