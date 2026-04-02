import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../../src/utils/token';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockGetItem = AsyncStorage.getItem as jest.Mock;

describe('token utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set and retrieve access token', async () => {
    await setTokens('access-123', 'refresh-456');

    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ['geek_chat_access_token', 'access-123'],
      ['geek_chat_refresh_token', 'refresh-456'],
    ]);
  });

  it('should get access token', async () => {
    mockGetItem.mockResolvedValueOnce('my-access-token');

    const token = await getAccessToken();
    expect(token).toBe('my-access-token');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('geek_chat_access_token');
  });

  it('should get refresh token', async () => {
    mockGetItem.mockResolvedValueOnce('my-refresh-token');

    const token = await getRefreshToken();
    expect(token).toBe('my-refresh-token');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('geek_chat_refresh_token');
  });

  it('should clear tokens', async () => {
    await clearTokens();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      'geek_chat_access_token',
      'geek_chat_refresh_token',
    ]);
  });

  it('should return null when no token stored', async () => {
    mockGetItem.mockResolvedValueOnce(null);

    const token = await getAccessToken();
    expect(token).toBeNull();
  });
});
