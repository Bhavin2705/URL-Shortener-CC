import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shortenUrl, type ShortenPayload } from '../services/api';
import type { UrlRecord } from '../types/url';
import UrlForm from '../components/UrlForm';
import CopyButton from '../components/CopyButton';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useToastContext } from '../components/ui/Layout';

const features = [
  { icon: '⚡', title: 'Instant shortening', desc: 'Generate short links in milliseconds' },
  { icon: '📊', title: 'Click analytics', desc: 'Track every click with detailed stats' },
  { icon: '🔒', title: 'Private dashboard', desc: 'Your links, visible only to you' },
  { icon: '⏰', title: 'Link expiration', desc: 'Set custom expiry dates on any link' },
];

export default function Home() {
  const { user } = useAuth();
  const { show } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlRecord | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload: ShortenPayload) => {
    if (!user) { show('Please sign in to create links', 'error'); return; }
    setLoading(true); setError(''); setResult(null); setShowQR(false);
    try {
      const data = await shortenUrl(payload);
      setResult(data);
      show('Link created!', 'success');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Something went wrong';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/6 rounded-full blur-3xl" />
        <div className="absolute top-32 left-1/4 w-64 h-64 bg-brand-700/5 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-32">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 badge-brand mb-6 text-xs px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Free · Secure · Instant
          </div>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-[0.95] tracking-tight mb-6">
            Short links that<br />
            <span className="bg-gradient-brand bg-clip-text text-transparent">
              mean business
            </span>
          </h1>
          <p className="text-surface-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Create, track, and manage short URLs with powerful analytics. Built for developers and teams.
          </p>
        </div>

        {/* Form card */}
        <div className="animate-fade-up [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="card p-6 shadow-glow-sm">
            {user ? (
              <UrlForm onSubmit={handleSubmit} loading={loading} />
            ) : (
              <div className="text-center py-4">
                <p className="text-surface-400 mb-4">Sign in to start creating short links</p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/login" className="btn-ghost">Sign in</Link>
                  <Link to="/register" className="btn-brand">Get started free</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-fade-in">
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 card p-6 border-brand-500/30 shadow-glow-sm animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="badge-green">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Link created
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <a href={result.shortUrl} target="_blank" rel="noreferrer"
                  className="font-mono font-semibold text-xl text-brand-300 hover:text-brand-200 transition-colors break-all">
                  {result.shortUrl}
                </a>
                <p className="text-surface-500 text-sm font-mono truncate mt-1">{result.originalUrl}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CopyButton text={result.shortUrl} />
                <button onClick={() => setShowQR(v => !v)} className="btn-ghost text-sm">
                  {showQR ? 'Hide QR' : 'QR Code'}
                </button>
              </div>
            </div>

            {showQR && (
              <div className="pt-4 border-t border-surface-800 animate-fade-in">
                <QRCodeDisplay url={result.shortUrl} />
              </div>
            )}
          </div>
        )}

        {/* Features grid */}
        <div className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card p-5 animate-fade-up opacity-0 [animation-fill-mode:forwards]"
              style={{ animationDelay: `${300 + i * 80}ms` }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-surface-100 text-sm mb-1">{f.title}</h3>
              <p className="text-surface-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
