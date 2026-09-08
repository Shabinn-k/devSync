import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from '../types';

export const authApi = {
    register: (data: RegisterRequest): Promise<AuthResponse> =>
        apiClient.post<ApiResponse<any>>('/auth/register', {
            ...data,
            confirm_password: data.confirm_password || data.password,
        })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    const d = res.data.data;
                    const access_token = d.access_token || d.token?.access_token;
                    const refresh_token = d.refresh_token || d.token?.refresh_token;
                    return {
                        ...d,
                        access_token,
                        refresh_token,
                    };
                }
                throw new Error(res.data.message || 'Registration failed');
            }),

    login: (data: LoginRequest): Promise<AuthResponse> =>
        apiClient.post<ApiResponse<any>>('/auth/login', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    const d = res.data.data;
                    const access_token = d.access_token || d.token?.access_token;
                    const refresh_token = d.refresh_token || d.token?.refresh_token;
                    return {
                        ...d,
                        access_token,
                        refresh_token,
                    };
                }
                throw new Error(res.data.message || 'Login failed');
            }),

    verifyEmail: (data: VerifyEmailRequest): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Verification failed');
            }),

    resendOTP: (email: string): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', { email })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to resend OTP');
            }),

    verifyOTP: (email: string, otp: string): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-otp', { email, otp })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'OTP verification failed');
            }),

    forgotPassword: (data: ForgotPasswordRequest): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to send reset link');
            }),

    resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
            ...data,
            confirm_password: data.confirm_password || data.new_password,
        })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Password reset failed');
            }),

    logout: (refreshToken: string): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>('/auth/logout', { refresh_token: refreshToken })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Logout failed');
            }),

    getMe: (): Promise<User> =>
        apiClient.get<ApiResponse<User>>('/auth/me')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to fetch user');
            }),
};