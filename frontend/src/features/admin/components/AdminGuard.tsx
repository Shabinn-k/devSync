import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { tokenStorage } from '../../../lib/tokenStorage';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isAuthenticated, hydrated, isLoading, getMe } = useAuthStore();
  const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken();

  useEffect(() => {
    if (token && !user && !isLoading) {
      getMe();
    }
  }, [token, user, isLoading, getMe]);

  if (!hydrated || (token && !user) || (isLoading && !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role_id === 3 || Number(user?.role_id) === 3 || user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};