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
  profileImageUrl?: string;
};

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/auth/me');
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
