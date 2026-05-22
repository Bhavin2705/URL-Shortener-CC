import jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET not defined');
  return value;
};
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (userId: string): string =>
  jwt.sign({ id: userId }, secret(), { expiresIn: expiresIn() } as jwt.SignOptions);

export const verifyToken = (token: string): { id: string } =>
  jwt.verify(token, secret()) as { id: string };

const cookieOptions = (): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAMESITE || (isProd ? 'strict' : 'lax')).toLowerCase();
  const normalizedSameSite = sameSite === 'none' ? 'none' : sameSite === 'strict' ? 'strict' : 'lax';
  const options: CookieOptions = {
    httpOnly: true,
    secure: normalizedSameSite === 'none' ? true : process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
    sameSite: normalizedSameSite,
    path: '/',
  };
  if (process.env.COOKIE_DOMAIN) options.domain = process.env.COOKIE_DOMAIN;
  return options;
};

export const attachCookie = (res: Response, token: string): void => {
  res.cookie('snip_token', token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearCookie = (res: Response): void => {
  res.clearCookie('snip_token', cookieOptions());
};
