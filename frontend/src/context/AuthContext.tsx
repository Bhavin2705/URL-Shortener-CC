import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/url';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Defensive cleanup: ensure legacy token keys are not persisted client-side.
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('snip_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('snip_token');
    getMe().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
  };

  const register = async (name: string, email: string, password: string) => {
    const u = await apiRegister(name, email, password);
    setUser(u);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const refreshMe = async () => {
    const u = await getMe();
    setUser(u);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
