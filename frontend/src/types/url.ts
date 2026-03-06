export interface UrlRecord {
  _id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string | null;
  shortUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
