import { useAuthStore } from '../../src/store/auth.store';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

// Mock auth API
jest.mock('../../src/api/auth', () => ({
  logout: jest.fn(() => Promise.resolve()),
}));

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it('should start with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set isAuthenticated to true after login', async () => {
    await useAuthStore.getState().login({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('test-access');
    expect(state.refreshToken).toBe('test-refresh');
  });

  it('should set isAuthenticated to false after logout', async () => {
    await useAuthStore.getState().login({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
    });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('should set user via setUser', () => {
    const user = { id: '1', nickname: 'Alice' };
    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toEqual(user);
  });
});
