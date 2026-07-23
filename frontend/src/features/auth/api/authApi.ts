import axios from 'axios';
import type { 
  ApiResponse, 
  AuthResponse, 
  MessageResponse,
  LoginPayload, 
  RegisterPayload, 
  VerifyEmailPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  LogoutPayload,
  TokenResponse,
  User,
  VerifyOTPPayload
} from '../../../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
apiClient.interceptors.request.use(
  (config) => { 
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    const token = localStorage.getItem('devsync_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
     
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh-token')) {
      localStorage.removeItem('devsync_access_token');
      localStorage.removeItem('devsync_refresh_token');
      localStorage.removeItem('devsync_user');
      window.dispatchEvent(new Event('auth:logout'));
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('devsync_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh-token', {
          refresh_token: refreshToken,
        });
        
        if (response.data.success && response.data.data) {
          const { access_token, refresh_token } = response.data.data;
          localStorage.setItem('devsync_access_token', access_token);
          localStorage.setItem('devsync_refresh_token', refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        // Clear all tokens and redirect to login
        localStorage.removeItem('devsync_access_token');
        localStorage.removeItem('devsync_refresh_token');
        localStorage.removeItem('devsync_user');
        window.dispatchEvent(new Event('auth:logout'));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then(res => res.data),

  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then(res => res.data),

 verifyEmail: (data: VerifyEmailPayload) =>
  apiClient.post<ApiResponse<MessageResponse>>('/auth/verify-email', data).then(res => res.data),

  resendOTP: (data: ResendOTPPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/resend-otp', data).then(res => res.data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/forgot-password', data).then(res => res.data),

   verifyOTP: (data: VerifyOTPPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/verify-otp', data).then(res => res.data),

  resetPassword: (data: ResetPasswordPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/reset-password', data).then(res => res.data),

  refreshToken: (data: RefreshTokenPayload) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh-token', data).then(res => res.data),

  logout: (data: LogoutPayload) =>
    apiClient.post<ApiResponse<MessageResponse>>('/auth/logout', data).then(res => res.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me').then(res => res.data),
};