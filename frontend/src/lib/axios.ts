import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, TokenResponse } from '../types/api';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }

    const token = localStorage.getItem('devsync_access_token');
    if (token) {
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      localStorage.removeItem('devsync_access_token');
      localStorage.removeItem('devsync_refresh_token');
      localStorage.removeItem('devsync_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      localStorage.removeItem('devsync_access_token');
      localStorage.removeItem('devsync_refresh_token');
      localStorage.removeItem('devsync_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('devsync_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<ApiResponse<TokenResponse>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (response.data.success && response.data.data) {
          const { access_token, refresh_token } = response.data.data;
          
          localStorage.setItem('devsync_access_token', access_token);
          localStorage.setItem('devsync_refresh_token', refresh_token);
          
          if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${access_token}`);
          } else {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('devsync_access_token');
        localStorage.removeItem('devsync_refresh_token');
        localStorage.removeItem('devsync_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;