import { create } from 'zustand';
import { authApi } from '../../features/auth/api/authApi';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
} from '../../types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  unverifiedEmail: string | null;
  resetEmail: string | null;
  resetOTP: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  resetPasswordWithOTP: (otp: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
  setUnverifiedEmail: (email: string | null) => void;
  setResetEmail: (email: string | null) => void;
  setResetOTP: (otp: string | null) => void;
  clearError: () => void;
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('devsync_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialAccessToken = localStorage.getItem('devsync_access_token');
const initialRefreshToken = localStorage.getItem('devsync_refresh_token');
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, _get) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:logout', () => {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  }

  return {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: !!(initialAccessToken && initialUser),
    isLoading: false,
    error: null,
    unverifiedEmail: null,
    resetEmail: null,
    resetOTP: null,

    login: async (payload: LoginPayload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.login(payload);
        if (response.success && response.data) {
          const { user, token } = response.data;
          const { access_token, refresh_token } = token;

          localStorage.setItem('devsync_access_token', access_token);
          localStorage.setItem('devsync_refresh_token', refresh_token);
          localStorage.setItem('devsync_user', JSON.stringify(user));

          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to login';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    register: async (payload: RegisterPayload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.register(payload);
        if (response.success && response.data?.user) {
          const registeredUser = response.data.user;
          set({
            unverifiedEmail: payload.email,
            isLoading: false,
            error: null,
          });
          return registeredUser;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to register';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    verifyEmail: async (payload: VerifyEmailPayload) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.verifyEmail(payload);
        if (!response.success) {
          throw new Error(response.message || 'Verification failed');
        }
        set({ isLoading: false, unverifiedEmail: null, error: null });
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to verify email';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    resendOTP: async (email: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authApi.resendOTP({ email });
        if (!response.success) {
          throw new Error(response.message || 'Failed to resend OTP');
        }
        set({ isLoading: false, error: null });
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to resend OTP';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    forgotPassword: async (email: string) => {
      set({ isLoading: true, error: null, resetEmail: email });
      try {
        const response = await authApi.forgotPassword({ email });
        if (!response.success) {
          throw new Error(response.message || 'Failed to send reset link');
        }
        set({ isLoading: false, error: null });
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to send reset link';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    // FIXED: Uses the new /auth/verify-otp endpoint
    verifyOTP: async (otp: string) => {
      set({ isLoading: true, error: null });
      try {
        const email = _get().resetEmail;
        if (!email) {
          throw new Error('No email found for verification');
        }

        // Using the dedicated verify-otp endpoint
        const response = await authApi.verifyOTP({ email, otp });
        
        if (!response.success) {
          throw new Error(response.message || 'Invalid OTP');
        }
        set({ isLoading: false, error: null, resetOTP: otp });
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Invalid OTP';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    resetPasswordWithOTP: async (otp: string, newPassword: string) => {
      set({ isLoading: true, error: null });
      try {
        const email = _get().resetEmail;
        if (!email) {
          throw new Error('No email found for password reset');
        }

        const response = await authApi.resetPassword({
          email,
          otp,
          new_password: newPassword,
          confirm_password: newPassword
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to reset password');
        }
        set({ isLoading: false, error: null, resetEmail: null, resetOTP: null });
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to reset password';
        set({ error: message, isLoading: false });
        throw new Error(message);
      }
    },

    logout: async () => {
      set({ isLoading: true });
      const currentRefresh = _get().refreshToken;
      if (currentRefresh) {
        try {
          await authApi.logout({ refresh_token: currentRefresh });
        } catch {
          // Ignore
        }
      }
      localStorage.removeItem('devsync_access_token');
      localStorage.removeItem('devsync_refresh_token');
      localStorage.removeItem('devsync_user');

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        resetEmail: null,
        resetOTP: null,
      });
    },

    fetchCurrentUser: async () => {
      set({ isLoading: true });
      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          const user = response.data;
          localStorage.setItem('devsync_user', JSON.stringify(user));
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err: any) {
        set({ isLoading: false });
        return null;
      }
    },

    setUnverifiedEmail: (email: string | null) => {
      set({ unverifiedEmail: email });
    },

    setResetEmail: (email: string | null) => {
      set({ resetEmail: email });
    },

    setResetOTP: (otp: string | null) => {
      set({ resetOTP: otp });
    },

    clearError: () => {
      set({ error: null });
    },
  };
});