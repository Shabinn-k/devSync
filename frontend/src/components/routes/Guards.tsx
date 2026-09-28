import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { tokenStorage } from '../../lib/tokenStorage';

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-black">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
  </div>
);

const redirectByRole = (roleId: number | undefined): string =>
  roleId === 3 ? '/admin' : '/dashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const getMe = useAuthStore((s) => s.getMe);
  const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken();
  const location = useLocation();

  useEffect(() => {
    if (token && !user && !isLoading) {
      getMe();
    }
  }, [token, user, isLoading, getMe]);

  if (!hydrated) return <LoadingScreen />;

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading && !user) return <LoadingScreen />;

  // Strict admin separation: an admin can never be in a non-admin page.
  // They get bounced back to /admin.
  const isAdmin = user?.role_id === 3;
  const isAdminPath = location.pathname.startsWith('/admin');
  if (isAdmin && !isAdminPath) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken();

  if (!hydrated || isLoading) return <LoadingScreen />;

  if (isAuthenticated && token) {
    return <Navigate to={redirectByRole(user?.role_id)} replace />;
  }

  return <>{children}</>;
};