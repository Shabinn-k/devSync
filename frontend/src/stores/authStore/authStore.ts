import { create } from 'zustand';
import { authApi } from '../../features/auth/api/authApi';
import type {
  User,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload
} from '../../types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  unverifiedEmail: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
  setUnverifiedEmail: (email: string | null) => void;
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

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen to global window logout events from Axios interceptor
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
      set({ isLoading: true, error: null });
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

    logout: async () => {
      set({ isLoading: true });
      const currentRefresh = get().refreshToken;
      if (currentRefresh) {
        try {
          await authApi.logout({ refresh_token: currentRefresh });
        } catch {
          // Ignore logout error if token is already invalidated
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

    clearError: () => {
      set({ error: null });
    },
  };
});