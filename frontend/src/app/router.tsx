import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage'; 
import { DashboardPage } from '../features/auth/pages/DashboardPage';
import { ProtectedRoute, PublicRoute } from '../components/routes/Guards';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';

export const AppRoutes = () => {
  return (
    <Routes>

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <PublicRoute>
            <VerifyEmailPage/>
          </PublicRoute>
        }
      />
 
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
 
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};