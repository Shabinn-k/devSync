import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, TokenResponse } from '../types/api';

// Extend the InternalAxiosRequestConfig type to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ============ REQUEST INTERCEPTOR ============
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    console.log('🔵 Request URL:', config.url);
    console.log('🔵 Request Method:', config.method);
    
    // ✅ Skip adding token for auth endpoints (login, register, refresh, etc.)
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/verify-otp', '/auth/resend-otp'];
    
    // Check if the request is to an auth endpoint
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (isAuthEndpoint) {
      console.log('🔵 Skipping token for auth endpoint');
      return config;
    }

    const token = localStorage.getItem('devsync_access_token');
    console.log('🔵 Token:', token ? '✅ EXISTS' : '❌ MISSING');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔵 Added Authorization header');
    } else {
      console.warn('🔴 No token found for request:', config.url);
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('🔴 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============ RESPONSE INTERCEPTOR ============
apiClient.interceptors.response.use(
  (response) => {
    console.log('🟢 Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    console.log('🔴 Response error:', error.response?.status, error.response?.config?.url);

    // Don't retry if it's already a retry or refresh token request
    if (
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      console.log('🔴 Retry failed or refresh token request, redirecting to login');
      localStorage.removeItem('devsync_access_token');
      localStorage.removeItem('devsync_refresh_token');
      localStorage.removeItem('devsync_user');
      window.dispatchEvent(new Event('auth:logout'));
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔴 401 Unauthorized, attempting to refresh token');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('devsync_refresh_token');
        console.log('🔵 Refresh token:', refreshToken ? '✅ EXISTS' : '❌ MISSING');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.post<ApiResponse<TokenResponse>>(
          '/auth/refresh-token',
          {
            refresh_token: refreshToken,
          }
        );

        if (response.data.success && response.data.data) {
          const { access_token, refresh_token } = response.data.data;

          console.log('🟢 Token refreshed successfully');
          
          localStorage.setItem('devsync_access_token', access_token);
          localStorage.setItem('devsync_refresh_token', refresh_token);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        console.log('🔴 Refresh token failed, redirecting to login');
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

export default apiClient;