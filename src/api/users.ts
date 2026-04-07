import { apiClient } from './client';

export type UserSearchResult = {
  id: string;
  nickname: string;
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
