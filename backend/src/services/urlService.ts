import Url from '../models/Url';
import ClickEvent from '../models/ClickEvent';
import { generateCode } from '../utils/generateCode';
import { analyzeUrlRisk } from '../utils/phishy';

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

export const createShortUrl = async (
  originalUrl: string, ownerId?: string, customCode?: string, expiresAt?: Date, title?: string,
) => {
  const shortCode = customCode || generateCode();
  if (await Url.findOne({ shortCode })) throw new Error(`Code "${shortCode}" already taken`);
  const normalizedOriginalUrl = assertHttpUrl(originalUrl);
  const risk = analyzeUrlRisk(normalizedOriginalUrl);
  return Url.create({
    shortCode,
    originalUrl: normalizedOriginalUrl,
    owner: ownerId ?? null,
    expiresAt: expiresAt ?? null,
    title: title ?? '',
    isPhishy: risk.isPhishy,
    phishyReasons: risk.reasons,
  });
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
  if (typeof updates.title === 'string') patch.title = updates.title;
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
