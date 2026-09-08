import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages 
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import VerifyOTPPage from "../features/auth/pages/VerifyOTPPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import RoleSelectionPage from "../features/auth/pages/RoleSelectionPage";

// Protected Pages
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import OrganizationsPage from "../features/organizations/pages/OrganizationsPage";
import OrganizationDetailPage from "../features/organizations/pages/OrganizationDetailPage";

// ✅ FIX: Use named imports (not default)
import { ProjectsPage } from "../features/projects/pages/ProjectPage";
import { ProjectDetailPage } from "../features/projects/pages/ProjectDetailPage";

// ✅ FIX: Use named imports (not default)
import { TasksPage } from "../features/tasks/pages/TaskPage";
import { TaskDetailPage } from "../features/tasks/pages/TaskDetailPage";

// Guards
import { ProtectedRoute, PublicRoute } from "../components/routes/Guards";
import { useAuthStore } from "../stores/authStore";
import { tokenStorage } from "../lib/tokenStorage";

const HomeRoute = () => {
    const { isAuthenticated } = useAuthStore();
    const hasToken = tokenStorage.hasValidSession();
    if (isAuthenticated && hasToken) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
};

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Home / Public Routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/role" element={<PublicRoute><RoleSelectionPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/verify-otp" element={<PublicRoute><VerifyOTPPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Organization Routes */}
            <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
            <Route path="/organizations/:id" element={<ProtectedRoute><OrganizationDetailPage /></ProtectedRoute>} />

            {/* Project Routes (specific subroutes before wildcard) */}
            <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:projectId/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />

            {/* Task Routes */}
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<HomeRoute />} />
        </Routes>
    );
};