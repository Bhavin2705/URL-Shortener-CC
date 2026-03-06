import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../components/ui/Layout';

export default function Login() {
  const { login } = useAuth();
  const { show } = useToastContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      show('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Login failed';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-up">
        {/* Glow orb */}
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
          <div className="w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-brand items-center justify-center shadow-glow mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M2 8C2 4.686 4.686 2 8 2s6 2.686 6 6-2.686 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M10.5 5.5L5.5 10.5M5.5 5.5h5v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-display font-bold text-2xl text-surface-100">Welcome back</h1>
            <p className="text-surface-500 text-sm mt-1">Sign in to your Snip account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-8 h-8"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 3l18 18" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10.58 10.58a2 2 0 102.83 2.83" strokeWidth="2" strokeLinecap="round" />
                      <path d="M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-1 2.24-2.71 4.08-4.88 5.26M6.61 6.61C4.62 7.9 3.1 9.78 2 12c1.73 3.89 6 7 10 7 1.24 0 2.44-.19 3.56-.54" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-brand w-full h-11 text-base mt-2">
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-surface-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
