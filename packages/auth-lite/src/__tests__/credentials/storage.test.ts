import * as SecureStore from 'expo-secure-store';
import { saveCredentials, clearCredentials } from '../../credentials/storage';
import type { Credentials } from '../../auth/signin';

jest.mock('expo-secure-store');
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Credentials Storage', () => {
  const mockCredentials: Credentials = {
    accessToken: 'mock-access-token',
    idToken: 'mock-id-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date('2025-12-31T23:59:59Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCredentials', () => {
    it('should save credentials to SecureStore', async () => {
      await saveCredentials(mockCredentials);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'factory_auth_lite_credentials',
        JSON.stringify({
          accessToken: mockCredentials.accessToken,
          idToken: mockCredentials.idToken,
          refreshToken: mockCredentials.refreshToken,
          expiresAt: mockCredentials.expiresAt.toISOString(),
        })
      );
    });

    it('should handle credentials without refresh token', async () => {
      const credsWithoutRefresh = {
        ...mockCredentials,
        refreshToken: undefined,
      };

      await saveCredentials(credsWithoutRefresh);

      const savedData = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed.refreshToken).toBeUndefined();
    });

    it('should convert Date to ISO string', async () => {
      await saveCredentials(mockCredentials);

      const savedData = (SecureStore.setItemAsync as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed.expiresAt).toBe('2025-12-31T23:59:59.000Z');
    });

    it('should throw error if SecureStore fails', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      await expect(saveCredentials(mockCredentials)).rejects.toThrow();
    });
  });

  describe('clearCredentials', () => {
    it('should delete credentials from SecureStore', async () => {
      await clearCredentials();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'factory_auth_lite_credentials'
      );
    });

    it('should throw error if SecureStore fails', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      await expect(clearCredentials()).rejects.toThrow();
    });
  });
});
