import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/token';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function onRefreshSuccess(newAccessToken: string): void {
  pendingRequests.forEach((req) => req.resolve(newAccessToken));
  pendingRequests = [];
}

function onRefreshFailure(error: Error): void {
  pendingRequests.forEach((req) => req.reject(error));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error(`Refresh failed: ${response.status}`);
  }

  const data = await response.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !path.includes('/auth/refresh')) {
    // 토큰 만료 → refresh 시도
    const newToken = await handleTokenRefresh();
    if (newToken) {
      // 새 토큰으로 원래 요청 재시도
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      });
      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status}`);
      }
      return retryResponse.json();
    }
    // refresh 실패 → 로그아웃 처리
    await clearTokens();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

async function handleTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    // 이미 refresh 진행 중이면 대기
    return new Promise<string>((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshAccessToken();
    onRefreshSuccess(newToken);
    return newToken;
  } catch (error) {
    onRefreshFailure(error instanceof Error ? error : new Error('Refresh failed'));
    return null;
  } finally {
    isRefreshing = false;
  }
}
