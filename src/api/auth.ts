import { apiClient } from './client';

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return apiClient<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export type MeResponse = {
  id: string;
  nickname: string;
  username?: string;
  profileImageUrl?: string;
};

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/auth/me');
}

export async function linkProvider(linkToken: string, confirm: boolean): Promise<TokenResponse> {
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${BASE_URL}/auth/link-provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkToken, confirm }),
  });
  if (!response.ok) {
    throw new Error(`Link provider failed: ${response.status}`);
  }
  return response.json();
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
