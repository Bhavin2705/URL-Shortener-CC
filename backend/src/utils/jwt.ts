import jwt from 'jsonwebtoken';
import { Response } from 'express';

const secret = () => process.env.JWT_SECRET || 'fallback_secret';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (userId: string): string =>
  jwt.sign({ id: userId }, secret(), { expiresIn: expiresIn() } as jwt.SignOptions);

export const verifyToken = (token: string): { id: string } =>
  jwt.verify(token, secret()) as { id: string };

export const attachCookie = (res: Response, token: string): void => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('snip_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearCookie = (res: Response): void => {
  res.clearCookie('snip_token', { httpOnly: true, path: '/' });
};
