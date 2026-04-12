import { apiClient } from './client';

export type UserSearchResult = {
  id: string;
  nickname: string;
  username?: string;
  profileImageUrl?: string;
};

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query || query.trim().length < 1) {
    return [];
  }
  return apiClient<UserSearchResult[]>(
    `/api/users/search?q=${encodeURIComponent(query.trim())}`,
  );
}

export async function setUsername(username: string): Promise<{ username: string }> {
  return apiClient<{ username: string }>('/api/users/me/username', {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  });
}
