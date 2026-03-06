import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from './ui/Layout';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { show } = useToastContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    show('Logged out successfully', 'info');
    navigate('/');
    setLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M10.5 5.5L5.5 10.5M5.5 5.5h5v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">snip</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {user && (
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-surface-800 text-surface-100'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-display font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-display font-semibold text-surface-100 leading-none">{user.name}</p>
                  <p className="text-xs text-surface-500 leading-none mt-0.5">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} disabled={loggingOut} className="btn-ghost text-xs px-4 py-2">
                {loggingOut ? '…' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign in</Link>
              <Link to="/register" className="btn-brand text-sm px-4 py-2">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
