import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="font-display font-black text-6xl text-surface-700 mb-4">404</p>
      <h1 className="font-display font-bold text-2xl text-surface-100 mb-2">Page not found</h1>
      <p className="text-surface-500 mb-8">
        That address does not match any page in Snip.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="btn-ghost">Home</Link>
        <Link to={user ? '/dashboard' : '/login'} className="btn-brand">
          {user ? 'Dashboard' : 'Sign in'}
        </Link>
      </div>
    </div>
  );
}
