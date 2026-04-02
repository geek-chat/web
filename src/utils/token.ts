import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'geek_chat_access_token';
const REFRESH_TOKEN_KEY = 'geek_chat_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, access],
    [REFRESH_TOKEN_KEY, refresh],
  ]);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
