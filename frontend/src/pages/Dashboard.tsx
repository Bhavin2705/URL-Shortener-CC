import { useEffect, useState, useCallback } from 'react';
import { fetchMyLinks, deleteLink, shortenUrl, type ShortenPayload } from '../services/api';
import type { UrlRecord } from '../types/url';
import UrlCard from '../components/UrlCard';
import UrlForm from '../components/UrlForm';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../components/ui/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const { show } = useToastContext();
  const [links, setLinks] = useState<UrlRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchMyLinks()
      .then(setLinks)
      .catch(() => show('Failed to load links', 'error'))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (payload: ShortenPayload) => {
    setCreating(true);
    try {
      const newLink = await shortenUrl(payload);
      setLinks(p => [newLink, ...p]);
      show('Link created!', 'success');
      setShowForm(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to create link';
      show(msg, 'error');
    } finally { setCreating(false); }
  };

  const handleDelete = async (code: string) => {
    try {
      await deleteLink(code);
      setLinks(p => p.filter(l => l.shortCode !== code));
      show('Link deleted', 'info');
    } catch { show('Failed to delete', 'error'); }
  };

  const filtered = links.filter(l =>
    l.shortCode.toLowerCase().includes(search.toLowerCase()) ||
    l.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    (l.title ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const activeLinks = links.filter(l => !l.expiresAt || new Date(l.expiresAt) > new Date()).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">
            Welcome back, <span className="text-surface-300 font-semibold">{user?.name}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-brand self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          New link
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="card p-5 border-brand-500/20 animate-fade-up">
          <p className="font-display font-semibold text-surface-300 text-sm mb-4">Create a new link</p>
          <UrlForm onSubmit={handleCreate} loading={creating} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 animate-fade-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Total links</p>
          <p className="font-display font-black text-3xl text-white">{links.length}</p>
        </div>
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Total clicks</p>
          <p className="font-display font-black text-3xl text-brand-400">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Active</p>
          <p className="font-display font-black text-3xl text-emerald-400">{activeLinks}</p>
        </div>
      </div>

      {/* Search */}
      {links.length > 0 && (
        <div className="relative animate-fade-up [animation-delay:150ms] opacity-0 [animation-fill-mode:forwards]">
          <svg className="w-4 h-4 text-surface-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search links…"
            className="input pl-11"
          />
        </div>
      )}

      {/* Link list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="w-8 h-8 animate-spin text-brand-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : links.length === 0 ? (
        <div className="card p-16 text-center border-dashed border-surface-700">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
          </div>
          <p className="font-display font-semibold text-surface-400 text-lg">No links yet</p>
          <p className="text-surface-600 text-sm mt-1">Create your first short link to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-brand mt-6 mx-auto">
            Create first link
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-surface-500 py-10">No links match your search.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((link, i) => (
            <div key={link._id} className="animate-fade-up opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: `${i * 50}ms` }}>
              <UrlCard url={link} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
