import { Routes, Route, Navigate } from "react-router-dom";

// ============ PUBLIC PAGES ============
import LandingPage from "../features/Landing/pages/LandingPage";

// ============ AUTH PAGES ============
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOTPPage from "../features/auth/pages/VerifyOTPPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import OrganizationsPage from '../features/organizations/pages/OrganizationsPage';
import OrganizationDetailPage from '../features/organizations/pages/OrganizationDetailPage';

// ============ PROTECTED PAGES ============
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/profile/pages/ProfilePage";

// ============ GUARDS ============
import { ProtectedRoute, PublicRoute } from "../components/routes/Guards";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication Routes */}
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
            <VerifyEmailPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <VerifyOTPPage />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* ============ PROTECTED ROUTES ============ */}
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
  path="/organizations"
  element={
    <ProtectedRoute>
      <OrganizationsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/organizations/:id"
  element={
    <ProtectedRoute>
      <OrganizationDetailPage />
    </ProtectedRoute>
  }
/>

      {/* ============ 404 - FALLBACK ============ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};