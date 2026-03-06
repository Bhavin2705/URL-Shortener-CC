import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAccount, updateSettings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../components/ui/Layout';

export default function Settings() {
  const { user, refreshMe, logout } = useAuth();
  const { show } = useToastContext();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword && newPassword !== confirmNewPassword) {
      show('New password and confirmation must match', 'error');
      return;
    }
    try {
      setSaving(true);
      await updateSettings({
        name: name.trim(),
        email: email.trim(),
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      await refreshMe();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      show('Settings updated', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to update settings';
      show(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (confirmation !== 'DELETE') {
      show('Type DELETE to confirm account deletion', 'error');
      return;
    }
    try {
      setDeleting(true);
      await deleteAccount(deletePassword);
      await logout();
      show('Account deleted', 'info');
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to delete account';
      show(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const renderPasswordInput = (
    value: string,
    setValue: (v: string) => void,
    visible: boolean,
    setVisible: (v: boolean) => void,
    placeholder: string,
    minLength?: number,
  ) => (
    <div className="relative">
      <input
        className="input pr-11"
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-8 h-8"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
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
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-surface-100">Settings</h1>
        <p className="text-surface-500 text-sm mt-1">Manage your profile, password, and account security.</p>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-xl text-surface-100">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="pt-2 border-t border-surface-800">
            <p className="label mb-2">Change password (optional)</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {renderPasswordInput(
                currentPassword,
                setCurrentPassword,
                showCurrentPassword,
                setShowCurrentPassword,
                'Current password',
              )}
              {renderPasswordInput(
                newPassword,
                setNewPassword,
                showNewPassword,
                setShowNewPassword,
                'New password',
                6,
              )}
            </div>
            <div className="mt-3">
              {renderPasswordInput(
                confirmNewPassword,
                setConfirmNewPassword,
                showConfirmNewPassword,
                setShowConfirmNewPassword,
                'Confirm new password',
                6,
              )}
            </div>
          </div>
          <button type="submit" className="btn-brand" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="card p-6 space-y-4 border border-rose-500/30">
        <h2 className="font-display font-semibold text-xl text-rose-300">Delete Account</h2>
        <p className="text-surface-500 text-sm">
          This action is permanent. Your links and account data will be removed.
        </p>
        <button
          type="button"
          className="btn-danger"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete account
        </button>
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="w-full max-w-md card p-6 border border-rose-500/30">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display font-semibold text-xl text-rose-300">Confirm account deletion</h3>
                <p className="text-surface-500 text-sm mt-1">Type DELETE and enter your password to continue.</p>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => {
                  if (!deleting) {
                    setShowDeleteModal(false);
                    setConfirmation('');
                    setDeletePassword('');
                  }
                }}
                aria-label="Close modal"
                title="Close"
              >
                x
              </button>
            </div>
            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <input
                className="input"
                type="text"
                placeholder="Type DELETE to confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
              {renderPasswordInput(
                deletePassword,
                setDeletePassword,
                showDeletePassword,
                setShowDeletePassword,
                'Enter current password',
              )}
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteModal(false);
                      setConfirmation('');
                      setDeletePassword('');
                    }
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-danger" disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
