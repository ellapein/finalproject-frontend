import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import Spinner from './Spinner';

/** Redirects guests to /login and users with the wrong role to their own home page. */
export default function ProtectedRoute({ role }: { role?: Role }) {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner label="Checking your session…" />;
  if (!profile) return <Navigate to="/login" replace />;
  if (role && profile.role !== role) {
    return <Navigate to={profile.role === 'adviser' ? '/adviser' : '/dashboard'} replace />;
  }
  return <Outlet />;
}
