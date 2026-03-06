import Url from '../models/Url';
import { generateCode } from '../utils/generateCode';

export const createShortUrl = async (
  originalUrl: string, ownerId: string, customCode?: string, expiresAt?: Date, title?: string,
) => {
  const shortCode = customCode || generateCode();
  if (await Url.findOne({ shortCode })) throw new Error(`Code "${shortCode}" already taken`);
  return Url.create({ shortCode, originalUrl, owner: ownerId, expiresAt: expiresAt ?? null, title: title ?? '' });
};

export const resolveCode = async (shortCode: string) => {
  const url = await Url.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } }, { new: true });
  if (!url) throw new Error('Short URL not found');
  if (url.expiresAt && url.expiresAt < new Date()) throw new Error('Short URL has expired');
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
