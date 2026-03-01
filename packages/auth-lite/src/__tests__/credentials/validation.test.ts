import * as SecureStore from 'expo-secure-store';
import { hasValidCredentials } from '../../credentials/validation';

jest.mock('expo-secure-store');
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Credentials Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasValidCredentials', () => {
    it('should return false when no credentials exist', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await hasValidCredentials();

      expect(result).toBe(false);
    });

    it('should return true for valid unexpired credentials', async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000); // 1 hour from now
      const credentials = {
        accessToken: 'token',
        idToken: 'id',
        expiresAt: futureDate.toISOString(),
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(credentials)
      );

      const result = await hasValidCredentials();

      expect(result).toBe(true);
    });

    it('should return false for expired credentials', async () => {
      const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
      const credentials = {
        accessToken: 'token',
        idToken: 'id',
        expiresAt: pastDate.toISOString(),
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(credentials)
      );

      const result = await hasValidCredentials();

      expect(result).toBe(false);
    });

    it('should respect minTtl parameter', async () => {
      const nearFutureDate = new Date(Date.now() + 30 * 1000); // 30 seconds from now
      const credentials = {
        accessToken: 'token',
        idToken: 'id',
        expiresAt: nearFutureDate.toISOString(),
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(credentials)
      );

      // Require at least 60 seconds TTL
      const result = await hasValidCredentials(60);

      expect(result).toBe(false);
    });

    it('should return true when TTL exceeds minTtl', async () => {
      const futureDate = new Date(Date.now() + 120 * 1000); // 2 minutes from now
      const credentials = {
        accessToken: 'token',
        idToken: 'id',
        expiresAt: futureDate.toISOString(),
      };

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(credentials)
      );

      // Require at least 60 seconds TTL
      const result = await hasValidCredentials(60);

      expect(result).toBe(true);
    });

    it('should return false on parse error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
        'invalid json'
      );

      const result = await hasValidCredentials();

      expect(result).toBe(false);
    });

    it('should return false on SecureStore error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('SecureStore error')
      );

      const result = await hasValidCredentials();

      expect(result).toBe(false);
    });
  });
});
