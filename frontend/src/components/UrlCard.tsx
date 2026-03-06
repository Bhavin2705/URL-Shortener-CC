import { Link } from 'react-router-dom';
import type { UrlRecord } from '../types/url';
import CopyButton from './CopyButton';

interface Props { url: UrlRecord; onDelete: (code: string) => void }

export default function UrlCard({ url, onDelete }: Props) {
  const expired = url.expiresAt ? new Date(url.expiresAt) < new Date() : false;
  const domain = (() => { try { return new URL(url.originalUrl).hostname; } catch { return url.originalUrl.slice(0, 30); } })();

  return (
    <div className={`card-hover p-5 ${expired ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Favicon */}
        <div className="shrink-0 w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center overflow-hidden mt-0.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            className="w-5 h-5 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-display font-semibold text-surface-100 text-sm">
              {url.title || domain}
            </p>
            {expired ? (
              <span className="badge-red">Expired</span>
            ) : url.expiresAt ? (
              <span className="badge-amber">Expires {new Date(url.expiresAt).toLocaleDateString()}</span>
            ) : (
              <span className="badge-green">Active</span>
            )}
          </div>

          {/* Short URL */}
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 hover:text-brand-300 font-mono text-sm font-medium transition-colors inline-block truncate max-w-xs"
          >
            {url.shortUrl.replace(/^https?:\/\//, '')}
          </a>

          {/* Original URL */}
          <p className="text-surface-500 text-xs font-mono truncate mt-0.5">
            {url.originalUrl}
          </p>

          {/* Meta */}
          <p className="text-surface-600 text-xs mt-2 font-display">
            Created {new Date(url.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Right side */}
        <div className="shrink-0 flex flex-col items-end gap-3">
          {/* Click count */}
          <div className="text-right">
            <p className="font-display font-bold text-2xl text-white leading-none">
              {url.clicks.toLocaleString()}
            </p>
            <p className="text-surface-500 text-xs font-display mt-0.5">clicks</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <CopyButton text={url.shortUrl} compact />
            <Link to={`/analytics/${url.shortCode}`} className="btn-icon" title="View analytics">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </Link>
            <button onClick={() => onDelete(url.shortCode)} className="btn-icon hover:text-rose-400 hover:border-rose-500/40" title="Delete">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
