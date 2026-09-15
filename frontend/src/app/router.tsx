import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../features/Landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOTPPage from "../features/auth/pages/VerifyOTPPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import RoleSelectionPage from "../features/auth/pages/RoleSelectionPage";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import OrganizationsPage from "../features/organizations/pages/OrganizationsPage";
import OrganizationDetailPage from "../features/organizations/pages/OrganizationDetailPage";

import { ProjectsPage } from "../features/projects/pages/ProjectPage";
import { CreateProjectPage } from "../features/projects/pages/CreateProjectPage";
import { ProjectDetailPage } from "../features/projects/pages/ProjectDetailPage";

import { TasksPage } from "../features/tasks/pages/TaskPage";
import { TaskDetailPage } from "../features/tasks/pages/TaskDetailPage";

import TeamDetailPage from "../features/teams/pages/TeamDetailPage";

import { ProtectedRoute, PublicRoute } from "../components/routes/Guards";
import { useAuthStore } from "../stores/authStore";
import { tokenStorage } from "../lib/tokenStorage";
import { InvitationPage } from "../features/invitations/pages/InvitationPage";
import ChatPage from "../features/chat/pages/ChatPage";

const RootRoute = () => {
  const { isAuthenticated } = useAuthStore();
  const hasToken = tokenStorage.hasValidSession();
  if (isAuthenticated && hasToken) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
      <Route path="/verify-otp" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/role" element={<PublicRoute><RoleSelectionPage /></PublicRoute>} />
      <Route path="/invite" element={<InvitationPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
      <Route path="/organizations/:id" element={<ProtectedRoute><OrganizationDetailPage /></ProtectedRoute>} />
      <Route path="/organizations/:organizeId/teams/:teamId" element={<ProtectedRoute><TeamDetailPage /></ProtectedRoute>} />

      <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/projects/create" element={<ProtectedRoute><CreateProjectPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />

      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />

      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<RootRoute />} />
    </Routes>
  );
};

export default AppRoutes;