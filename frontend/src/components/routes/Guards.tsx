import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { tokenStorage } from '../../lib/tokenStorage';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user, getMe } = useAuthStore();
    const hasToken = tokenStorage.hasValidSession();
    const location = useLocation();

    useEffect(() => {
        if (hasToken && !user && !isLoading) {
            getMe();
        }
    }, [hasToken, user, isLoading, getMe]);

    if (!hasToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading && !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const hasToken = tokenStorage.hasValidSession();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
    }

    if (isAuthenticated && hasToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};