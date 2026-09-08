import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../../auth/api/authApi';
import { tokenStorage } from '../../../lib/tokenStorage';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    UserRole,
    VerifyEmailRequest,
} from '../../auth/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    selectedRole: UserRole | null;
    unverifiedEmail: string | null;
    resetEmail: string | null;
    resetOTP: string | null;

    setSelectedRole: (role: UserRole | null) => void;
    setResetEmail: (email: string | null) => void;
    register: (data: RegisterRequest) => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    getMe: () => Promise<void>;
    verifyEmail: (data: VerifyEmailRequest) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
    verifyOTP: (otp: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPasswordWithOTP: (otp: string, newPassword: string) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: tokenStorage.getUser(),
            accessToken: tokenStorage.getAccessToken(),
            refreshToken: tokenStorage.getRefreshToken(),
            isAuthenticated: tokenStorage.hasValidSession(),
            isLoading: false,
            error: null,
            selectedRole: null,
            unverifiedEmail: null,
            resetEmail: null,
            resetOTP: null,

            setSelectedRole: (role) => {
                set({ selectedRole: role });
            },

            setResetEmail: (email) => {
                set({ resetEmail: email });
            },

            register: async (data: RegisterRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.register(data);
                    const accessToken = response.access_token || response.token?.access_token;
                    const refreshToken = response.refresh_token || response.token?.refresh_token;

                    tokenStorage.setTokens(accessToken, refreshToken);
                    if (response.user) {
                        tokenStorage.setUser(response.user);
                    }
                    set({
                        user: response.user || null,
                        accessToken: accessToken || null,
                        refreshToken: refreshToken || null,
                        isAuthenticated: !!accessToken,
                        isLoading: false,
                        unverifiedEmail: data.email,
                        selectedRole: null,
                    });
                } catch (err: any) {
                    set({ error: err.message || 'Registration failed', isLoading: false });
                    throw err;
                }
            },

            login: async (data: LoginRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.login(data);
                    const accessToken = response.access_token || response.token?.access_token;
                    const refreshToken = response.refresh_token || response.token?.refresh_token;

                    tokenStorage.setTokens(accessToken, refreshToken);
                    if (response.user) {
                        tokenStorage.setUser(response.user);
                    }
                    set({
                        user: response.user || null,
                        accessToken: accessToken || null,
                        refreshToken: refreshToken || null,
                        isAuthenticated: !!accessToken,
                        isLoading: false,
                    });
                } catch (err: any) {
                    set({ error: err.message || 'Login failed', isLoading: false });
                    throw err;
                }
            },

            logout: async () => {
                const currentRefreshToken = tokenStorage.getRefreshToken() || get().refreshToken;
                set({ isLoading: true });
                try {
                    if (currentRefreshToken) {
                        await authApi.logout(currentRefreshToken);
                    }
                } catch {
                    // Ignore logout API failure
                } finally {
                    tokenStorage.clearAllAuth();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        selectedRole: null,
                        unverifiedEmail: null,
                        resetEmail: null,
                        resetOTP: null,
                    });
                }
            },

            getMe: async () => {
                const token = tokenStorage.getAccessToken() || get().accessToken;
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }
                try {
                    const user = await authApi.getMe();
                    tokenStorage.setUser(user);
                    set({ user, isAuthenticated: true });
                } catch (err: any) {
                    if (err?.response?.status === 401) {
                        await get().logout();
                    }
                }
            },

            verifyEmail: async (data: VerifyEmailRequest) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.verifyEmail(data);
                    set({ isLoading: false, unverifiedEmail: null });
                } catch (err: any) {
                    set({ error: err.message || 'Email verification failed', isLoading: false });
                    throw err;
                }
            },

            resendOTP: async (email: string) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.resendOTP(email);
                    set({ isLoading: false });
                } catch (err: any) {
                    set({ error: err.message || 'Failed to resend OTP', isLoading: false });
                    throw err;
                }
            },

            verifyOTP: async (otp: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { resetEmail } = get();
                    if (!resetEmail) {
                        throw new Error('No reset email found. Please request OTP again.');
                    }
                    await authApi.verifyOTP(resetEmail, otp);
                    set({ isLoading: false, resetOTP: otp });
                } catch (err: any) {
                    set({ error: err.message || 'OTP verification failed', isLoading: false });
                    throw err;
                }
            },

            forgotPassword: async (email: string) => {
                set({ isLoading: true, error: null });
                try {
                    await authApi.forgotPassword({ email });
                    set({ isLoading: false, resetEmail: email });
                } catch (err: any) {
                    set({ error: err.message || 'Failed to send reset email', isLoading: false });
                    throw err;
                }
            },

            resetPasswordWithOTP: async (otp: string, newPassword: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { resetEmail } = get();
                    if (!resetEmail) {
                        throw new Error('Reset email not found. Please start over.');
                    }
                    await authApi.resetPassword({
                        email: resetEmail,
                        otp,
                        new_password: newPassword,
                        confirm_password: newPassword,
                    });
                    set({ isLoading: false, resetEmail: null, resetOTP: null });
                } catch (err: any) {
                    set({ error: err.message || 'Failed to reset password', isLoading: false });
                    throw err;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
                selectedRole: state.selectedRole,
                unverifiedEmail: state.unverifiedEmail,
                resetEmail: state.resetEmail,
            }),
        }
    )
);