import Url from '../models/Url';
import ClickEvent from '../models/ClickEvent';
import { generateCode } from '../utils/generateCode';
import { analyzeUrlRisk } from '../utils/phishy';

const MAX_TITLE_LENGTH = 120;
const GENERATED_CODE_RETRIES = 5;

const assertHttpUrl = (value: string): string => {
  const normalized = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('Invalid URL');
  }
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('URL must use http or https');
  }
  return parsed.toString();
};

const RESERVED_CODES = new Set([
  'admin',
  'analytics',
  'api',
  'assets',
  'dashboard',
  'favicon.ico',
  'login',
  'register',
  'settings',
]);

const normalizeShortCode = (value?: string): string => {
  if (!value) return generateCode();
  const code = value.trim();
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(code)) {
    throw new Error('Custom alias must be 3-64 characters using only letters, numbers, hyphens, or underscores');
  }
  if (RESERVED_CODES.has(code.toLowerCase())) {
    throw new Error(`Custom alias "${code}" is reserved`);
  }
  return code;
};

const normalizeTitle = (value?: string): string => {
  if (!value) return '';
  const title = value.trim();
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }
  return title;
};

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000;

export const createShortUrl = async (
  originalUrl: string, ownerId?: string, customCode?: string, expiresAt?: Date, title?: string,
) => {
  const normalizedOriginalUrl = assertHttpUrl(originalUrl);
  const normalizedTitle = normalizeTitle(title);
  const risk = analyzeUrlRisk(normalizedOriginalUrl);
  const attempts = customCode ? 1 : GENERATED_CODE_RETRIES;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const shortCode = normalizeShortCode(customCode);
    if (await Url.findOne({ shortCode })) {
      if (customCode) throw new Error(`Code "${shortCode}" already taken`);
      continue;
    }

    try {
      return await Url.create({
        shortCode,
        originalUrl: normalizedOriginalUrl,
        owner: ownerId ?? null,
        expiresAt: expiresAt ?? null,
        title: normalizedTitle,
        isPhishy: risk.isPhishy,
        phishyReasons: risk.reasons,
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        if (customCode) throw new Error(`Code "${shortCode}" already taken`);
        continue;
      }
      throw error;
    }
  }

  throw new Error('Unable to generate a unique short code');
};

export const resolveCode = async (shortCode: string) => {
  const url = await Url.findOne({ shortCode });
  if (!url) throw new Error('Short URL not found');
  if (url.expiresAt && url.expiresAt < new Date()) throw new Error('Short URL has expired');
  url.clicks += 1;
  await url.save();
  return url;
};

export const getUserUrls = async (ownerId: string) =>
  Url.find({ owner: ownerId }).sort({ createdAt: -1 });

export const getUserUrlStats = async (shortCode: string, ownerId: string) => {
  const url = await Url.findOne({ shortCode, owner: ownerId });
  if (!url) throw new Error('Short URL not found');
  return url;
};

export const deleteUserUrl = async (shortCode: string, ownerId: string) => {
  const url = await Url.findOneAndDelete({ shortCode, owner: ownerId });
  if (!url) throw new Error('Short URL not found');
};

export const updateUserUrl = async (
  shortCode: string,
  ownerId: string,
  updates: { originalUrl?: string; title?: string; expiresAt?: Date | null },
) => {
  const patch: {
    originalUrl?: string;
    title?: string;
    expiresAt?: Date | null;
    isPhishy?: boolean;
    phishyReasons?: string[];
  } = {};
  if (typeof updates.originalUrl === 'string') {
    const normalizedOriginalUrl = assertHttpUrl(updates.originalUrl);
    patch.originalUrl = normalizedOriginalUrl;
    const risk = analyzeUrlRisk(normalizedOriginalUrl);
    patch.isPhishy = risk.isPhishy;
    patch.phishyReasons = risk.reasons;
  }
  if (typeof updates.title === 'string') patch.title = normalizeTitle(updates.title);
  if (updates.expiresAt !== undefined) patch.expiresAt = updates.expiresAt;
  const url = await Url.findOneAndUpdate({ shortCode, owner: ownerId }, patch, { new: true });
  if (!url) throw new Error('Short URL not found');
  return url;
};

export const getAllUrls = async () =>
  Url.find({}).sort({ createdAt: -1 }).populate('owner', 'name email role');

export const deleteAnyUrl = async (shortCode: string) => {
  const url = await Url.findOneAndDelete({ shortCode });
  if (!url) throw new Error('Short URL not found');
};

export const recordClickEvent = async (
  urlId: string,
  details: {
    ownerId?: string | null;
    shortCode: string;
    originalUrl: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
    isPhishy: boolean;
  },
) => {
  await ClickEvent.create({
    url: urlId,
    owner: details.ownerId ?? null,
    shortCode: details.shortCode,
    originalUrl: details.originalUrl,
    ip: details.ip ?? '',
    userAgent: details.userAgent ?? '',
    referrer: details.referrer ?? '',
    isPhishy: details.isPhishy,
  });
};
