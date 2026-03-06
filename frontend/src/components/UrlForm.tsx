import { useState, type FormEvent } from 'react';
import type { ShortenPayload } from '../services/api';

interface Props { onSubmit: (p: ShortenPayload) => Promise<void>; loading: boolean }

export default function UrlForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [expires, setExpires] = useState('');
  const [adv, setAdv] = useState(false);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    await onSubmit({ originalUrl: url.trim(), customCode: alias.trim() || undefined, expiresAt: expires || undefined, title: title.trim() || undefined });
    setUrl(''); setTitle(''); setAlias(''); setExpires('');
  };

  return (
    <form onSubmit={handle} className="space-y-5">
      {/* Main row */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </div>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste your long URL here…"
          required
          className="input pl-10 pr-36 h-14 text-base rounded-2xl"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-brand absolute right-2 top-2 bottom-2 px-5 rounded-xl text-sm"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          )}
          {loading ? 'Creating…' : 'Shorten'}
        </button>
      </div>

      <button type="button" onClick={() => setAdv(v => !v)}
        className="flex items-center gap-1.5 text-xs font-display font-semibold text-surface-500 hover:text-surface-300 transition-colors">
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${adv ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
        {adv ? 'Hide' : 'Show'} advanced options
      </button>

      {adv && (
        <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-surface-800">
          <div>
            <label className="label">Link title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My campaign link" className="input" />
          </div>
          <div>
            <label className="label">Custom alias</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 text-sm font-mono">snip/</span>
              <input type="text" value={alias} onChange={e => setAlias(e.target.value)} placeholder="my-link" className="input pl-12" />
            </div>
          </div>
          <div>
            <label className="label">Expires at</label>
            <input type="datetime-local" value={expires} onChange={e => setExpires(e.target.value)} className="input" />
          </div>
        </div>
      )}
    </form>
  );
}
