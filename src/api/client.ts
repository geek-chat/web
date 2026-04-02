import { getAccessToken } from '../utils/token';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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

  if (!response.ok) {
    // TODO: 401 시 자동 refresh 로직 추가
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
