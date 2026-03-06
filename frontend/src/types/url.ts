export interface UrlRecord {
  _id: string;
  shortCode: string;
  originalUrl: string;
  title?: string;
  clicks: number;
  isPhishy?: boolean;
  phishyReasons?: string[];
  createdAt: string;
  expiresAt?: string | null;
  shortUrl: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isBlocked?: boolean;
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
}
