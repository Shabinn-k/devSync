import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import { tokenStorage } from '../../lib/tokenStorage';

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

    if (!hydrated) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
    }

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading && !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
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
    const token = useAuthStore((s) => s.token || s.accessToken) || tokenStorage.getAccessToken();

    if (!hydrated || isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
    }

    if (isAuthenticated && token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};