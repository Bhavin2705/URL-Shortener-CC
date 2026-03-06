import axios from 'axios';
import type { UrlRecord, User } from '../types/url';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// Auth
export const register = (name: string, email: string, password: string) =>
  api.post<{ user: User }>('/api/auth/register', { name, email, password }).then(r => r.data.user);

export const login = (email: string, password: string) =>
  api.post<{ user: User }>('/api/auth/login', { email, password }).then(r => r.data.user);

export const logout = () => api.post('/api/auth/logout');

export const getMe = () =>
  api.get<{ user: User }>('/api/auth/me').then(r => r.data.user);

export interface UpdateSettingsPayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const updateSettings = (payload: UpdateSettingsPayload) =>
  api.patch<{ user: User }>('/api/auth/settings', payload).then((r) => r.data.user);

export const deleteAccount = (password: string) =>
  api.delete('/api/auth/account', { data: { confirmation: 'DELETE', password } });

// URLs
export interface ShortenPayload {
  originalUrl: string;
  customCode?: string;
  expiresAt?: string;
  title?: string;
}
export const shortenUrl = (p: ShortenPayload) =>
  api.post<UrlRecord>('/api/shorten', p).then(r => r.data);

export const fetchMyLinks = () =>
  api.get<UrlRecord[]>('/api/links').then(r => r.data);

export const updateLink = (code: string, p: Partial<ShortenPayload>) =>
  api.patch<UrlRecord>(`/api/links/${code}`, p).then(r => r.data);

export const deleteLink = (code: string) =>
  api.delete(`/api/links/${code}`);

export const fetchStats = (code: string) =>
  api.get<UrlRecord>(`/api/stats/${code}`).then(r => r.data);

export interface AdminOverview {
  users: number;
  admins: number;
  links: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  blockedAt?: string | null;
  createdAt: string;
}

export const fetchAdminOverview = () =>
  api.get<AdminOverview>('/api/admin/overview').then(r => r.data);

export const fetchAdminUsers = () =>
  api.get<AdminUser[]>('/api/admin/users').then(r => r.data);

export const setAdminUserRole = (id: string, role: 'user' | 'admin') =>
  api.patch<AdminUser>(`/api/admin/users/${id}/role`, { role }).then(r => r.data);

export const setAdminUserBlocked = (id: string, blocked: boolean) =>
  api.patch<AdminUser>(`/api/admin/users/${id}/block`, { blocked }).then(r => r.data);

export interface AdminAnalyticsTotals {
  totalUsers: number;
  blockedUsers: number;
  totalLinks: number;
  phishyLinks: number;
  totalClicks: number;
  clicksLast7Days: number;
  phishyClicksLast7Days: number;
}

export interface AdminDailyUsage {
  _id: string;
  clicks: number;
}

export interface AdminPhishyEvent {
  _id: string;
  createdAt: string;
  shortCode: string;
  originalUrl: string;
  ip?: string;
  referrer?: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  } | null;
}

export interface AdminAnalyticsResponse {
  totals: AdminAnalyticsTotals;
  dailyUsage: AdminDailyUsage[];
  flaggedLinks: Array<{
    _id: string;
    shortCode: string;
    title?: string;
    clicks: number;
    isPhishy: boolean;
    phishyReasons?: string[];
    createdAt: string;
  }>;
  phishyEvents: AdminPhishyEvent[];
}

export const fetchAdminAnalytics = () =>
  api.get<AdminAnalyticsResponse>('/api/admin/analytics').then((r) => r.data);
