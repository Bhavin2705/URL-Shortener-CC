import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStats } from '../services/api';
import type { UrlRecord } from '../types/url';
import CopyButton from '../components/CopyButton';
import QRCodeDisplay from '../components/QRCodeDisplay';

export default function Analytics() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<UrlRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;
    fetchStats(code).then(setData).catch(() => setError('Link not found or access denied')).finally(() => setLoading(false));
  }, [code]);

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );

  if (error || !data)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="font-display font-bold text-5xl text-surface-700 mb-4">404</p>
        <p className="text-surface-500 mb-8">{error || 'Link not found'}</p>
        <Link to="/dashboard" className="btn-brand">← Back to dashboard</Link>
      </div>
    );

  const expired = data.expiresAt ? new Date(data.expiresAt) < new Date() : false;
  const domain = (() => { try { return new URL(data.originalUrl).hostname; } catch { return ''; } })();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-up">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-surface-500 hover:text-surface-300 text-sm font-display font-medium transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Dashboard
        </Link>
        <h1 className="font-display font-bold text-3xl text-white">Link Analytics</h1>
        <p className="text-surface-500 text-sm mt-1 font-mono">/{data.shortCode}</p>
      </div>

      {/* Big number */}
      <div className="card p-8 border-brand-500/20 shadow-glow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider mb-1">Total clicks</p>
            <p className="font-display font-black text-6xl text-brand-400 leading-none">
              {data.clicks.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-start sm:items-end">
            {expired ? <span className="badge-red">Expired</span> : <span className="badge-green">Active</span>}
            <p className="text-surface-600 text-xs font-mono">
              Created {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-5 space-y-4">
          <div>
            <p className="label">Short URL</p>
            <div className="flex items-center gap-2 mt-1">
              <a href={data.shortUrl} target="_blank" rel="noreferrer"
                className="font-mono text-brand-400 hover:text-brand-300 text-sm font-medium truncate transition-colors">
                {data.shortUrl}
              </a>
            </div>
          </div>
          <div>
            <p className="label">Original URL</p>
            <p className="text-surface-400 text-sm font-mono break-all mt-1">{data.originalUrl}</p>
          </div>
          {data.title && (
            <div>
              <p className="label">Title</p>
              <p className="text-surface-300 text-sm mt-1">{data.title}</p>
            </div>
          )}
          {data.expiresAt && (
            <div>
              <p className="label">Expires</p>
              <p className={`text-sm mt-1 font-mono ${expired ? 'text-rose-400' : 'text-surface-400'}`}>
                {new Date(data.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
          <div className="pt-2">
            <CopyButton text={data.shortUrl} />
          </div>
        </div>

        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <p className="label self-start">QR Code</p>
          <QRCodeDisplay url={data.shortUrl} size={160} />
        </div>
      </div>

      {/* Domain info */}
      {domain && (
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center overflow-hidden shrink-0">
            <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-5 h-5"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div>
            <p className="label">Destination domain</p>
            <p className="text-surface-300 text-sm font-mono">{domain}</p>
          </div>
        </div>
      )}
    </div>
  );
}
