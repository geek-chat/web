import { create } from 'zustand';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../utils/token';
import { logout as logoutApi } from '../api/auth';
import type { User } from '../types';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  restoreAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  login: async ({ accessToken, refreshToken }) => {
    await setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  logout: async () => {
    const { refreshToken } = get();
    const storedRefreshToken = refreshToken || (await getRefreshToken());
    if (storedRefreshToken) {
      try {
        await logoutApi(storedRefreshToken);
      } catch {
        // 서버 로그아웃 실패해도 로컬은 클리어
      }
    }
    await clearTokens();
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  restoreAuth: async () => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
