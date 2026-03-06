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

export const deleteLink = (code: string) =>
  api.delete(`/api/links/${code}`);

export const fetchStats = (code: string) =>
  api.get<UrlRecord>(`/api/stats/${code}`).then(r => r.data);
