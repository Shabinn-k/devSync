import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { tokenStorage } from './tokenStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
 
apiClient.interceptors.request.use(
  (config) => {
    let token =
      useAuthStore.getState().token ||
      useAuthStore.getState().accessToken ||
      null;

    if (!token) {
      try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.state?.token || parsed?.state?.accessToken || null;
        }
      } catch {}
    }
    if (!token) token = tokenStorage.getAccessToken();

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      const refreshToken =
        useAuthStore.getState().refreshToken ||
        (() => {
          try {
            const raw = localStorage.getItem('auth-storage');
            return raw ? JSON.parse(raw)?.state?.refreshToken : null;
          } catch {
            return null;
          }
        })();

      if (!refreshToken) {
        useAuthStore.getState().logout?.();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refresh_token: refreshToken }
        );

        const data = res.data?.data || res.data;
        const newAccess =
          data?.token || data?.access_token || data?.accessToken;
        const newRefresh = data?.refresh_token || data?.refreshToken;

        if (!newAccess) throw new Error('No token in refresh response');

        useAuthStore.setState((state) => ({
          ...state,
          token: newAccess,
          accessToken: newAccess,
          refreshToken: newRefresh || state.refreshToken,
        }));

        tokenStorage.setTokens(newAccess, newRefresh);

        refreshQueue.forEach((cb) => cb(newAccess));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        refreshQueue.forEach((cb) => cb(null));
        refreshQueue = [];
        useAuthStore.getState().logout?.();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;