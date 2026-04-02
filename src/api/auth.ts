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

export async function logout(refreshToken: string): Promise<void> {
  await apiClient<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}
