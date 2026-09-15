import type { User } from '../features/auth/types';

const ACCESS_TOKEN_KEY = 'devsync_access_token';
const REFRESH_TOKEN_KEY = 'devsync_refresh_token';
const USER_KEY = 'devsync_user';
const ZUSTAND_AUTH_KEY = 'auth-storage';

function readFromZustand(): { token: string | null; refreshToken: string | null; user: User | null } {
  try {
    const raw = localStorage.getItem(ZUSTAND_AUTH_KEY);
    if (!raw) return { token: null, refreshToken: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.state?.token || parsed?.state?.accessToken || null,
      refreshToken: parsed?.state?.refreshToken || null,
      user: parsed?.state?.user || null,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY) || readFromZustand().token;
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || readFromZustand().refreshToken;
  },

  setTokens(accessToken?: string | null, refreshToken?: string | null): void {
    if (typeof window === 'undefined') return;
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return readFromZustand().user;
  },

  setUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  clearAllAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ZUSTAND_AUTH_KEY);
  },

  hasValidSession(): boolean {
    return !!this.getAccessToken();
  },
};