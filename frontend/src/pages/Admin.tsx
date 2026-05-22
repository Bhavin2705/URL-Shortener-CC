import { useCallback, useEffect, useState } from 'react';
import {
  fetchAdminAnalytics,
  fetchAdminOverview,
  fetchAdminUsers,
  setAdminUserBlocked,
  setAdminUserRole,
  type AdminAnalyticsResponse,
  type AdminOverview,
  type AdminUser,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../components/ui/Layout';

export default function Admin() {
  const { user: me } = useAuth();
  const { show } = useToastContext();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchAdminOverview(), fetchAdminUsers(), fetchAdminAnalytics()])
      .then(([o, u, a]) => {
        setOverview(o);
        setUsers(u);
        setAnalytics(a);
      })
      .catch(() => show('Failed to load admin data', 'error'))
      .finally(() => setLoading(false));
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    try {
      const updated = await setAdminUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      show('User role updated', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to update role';
      show(msg, 'error');
    }
  };

  const handleBlockedChange = async (userId: string, blocked: boolean) => {
    try {
      const updated = await setAdminUserBlocked(userId, blocked);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      show(blocked ? 'User blocked' : 'User unblocked', 'info');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to update block state';
      show(msg, 'error');
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-surface-500">Loading admin data...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-surface-100">Admin Console</h1>
        <p className="text-surface-500 text-sm mt-1">Manage users, links, and platform security.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Users</p>
          <p className="font-display font-black text-3xl text-surface-100">{overview?.users ?? 0}</p>
        </div>
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Admins</p>
          <p className="font-display font-black text-3xl text-brand-400">{overview?.admins ?? 0}</p>
        </div>
        <div className="stat-box">
          <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Links</p>
          <p className="font-display font-black text-3xl text-emerald-400">{overview?.links ?? 0}</p>
        </div>
      </div>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold text-surface-100 text-lg">Usage Analytics</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="stat-box">
            <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Total clicks</p>
            <p className="font-display font-black text-3xl text-surface-100">{analytics?.totals.totalClicks ?? 0}</p>
          </div>
          <div className="stat-box">
            <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Clicks (7d)</p>
            <p className="font-display font-black text-3xl text-brand-400">{analytics?.totals.clicksLast7Days ?? 0}</p>
          </div>
          <div className="stat-box">
            <p className="text-surface-500 text-xs font-display font-semibold uppercase tracking-wider">Blocked users</p>
            <p className="font-display font-black text-3xl text-rose-400">{analytics?.totals.blockedUsers ?? 0}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-xs text-amber-500 uppercase tracking-wider font-display font-semibold">Potential phishy links</p>
            <p className="font-display font-black text-3xl text-amber-400 mt-2">{analytics?.totals.phishyLinks ?? 0}</p>
          </div>
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="text-xs text-amber-500 uppercase tracking-wider font-display font-semibold">Phishy clicks (7d)</p>
            <p className="font-display font-black text-3xl text-amber-400 mt-2">{analytics?.totals.phishyClicksLast7Days ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold text-surface-100 text-lg">Users</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-surface-700 bg-surface-800/50 p-3">
              <div>
                <p className="text-surface-100 font-display font-medium">{u.name}</p>
                <p className="text-surface-500 text-xs">{u.email}</p>
                <p className="text-surface-600 text-xs mt-1">
                  Role: {u.role} | Status: {u.isBlocked ? 'blocked' : 'active'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value as 'user' | 'admin')}
                  className="input h-10 py-2 w-32"
                  disabled={u._id === me?.id}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={() => handleBlockedChange(u._id, !u.isBlocked)}
                  disabled={u._id === me?.id || u.role === 'admin'}
                  className={u.isBlocked ? 'btn-brand text-xs px-3 py-2' : 'btn-danger text-xs px-3 py-2'}
                >
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold text-surface-100 text-lg">Flagged Link Summary</h2>
        <p className="text-surface-500 text-sm">Only potentially risky links are shown here. Full user link lists are hidden for privacy.</p>
        <div className="space-y-2">
          {(analytics?.flaggedLinks ?? []).map((l) => (
            <div key={l._id} className="rounded-xl border border-surface-700 bg-surface-800/50 p-3">
              <div className="min-w-0">
                <p className="text-surface-100 text-sm font-mono">/{l.shortCode}</p>
                <p className="text-surface-500 text-xs mt-1">Clicks: {l.clicks} | Created: {new Date(l.createdAt).toLocaleDateString()}</p>
                {(l.phishyReasons ?? []).length > 0 && <p className="text-amber-300 text-xs mt-1">Reasons: {l.phishyReasons?.join(', ')}</p>}
              </div>
            </div>
          ))}
          {(analytics?.flaggedLinks?.length ?? 0) === 0 && (
            <p className="text-surface-500 text-sm">No flagged links right now.</p>
          )}
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold text-surface-100 text-lg">Recent Potentially Phishy Clicks</h2>
        <div className="space-y-2">
          {(analytics?.phishyEvents ?? []).map((e) => (
            <div key={e._id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-surface-100 text-sm font-mono break-all">{e.originalUrl}</p>
              <p className="text-surface-500 text-xs mt-1">
                code: {e.shortCode} | user: {e.owner?.email ?? 'guest'} | at: {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {(analytics?.phishyEvents?.length ?? 0) === 0 && (
            <p className="text-surface-500 text-sm">No phishy click events detected yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
