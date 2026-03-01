import {
  setMigrationCallback,
  checkAndMigrate,
  resetMigrationFlag,
  type MigrationCallback,
} from '../../linking/migration';

jest.mock('../../anonymous', () => ({
  loadAnonymousId: jest.fn(),
  clearAnonymousIdWithCache: jest.fn(),
}));
jest.mock('../../credentials/retrieval', () => ({
  getCredentials: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { loadAnonymousId, clearAnonymousIdWithCache } from '../../anonymous';
import { getCredentials } from '../../credentials/retrieval';

describe('Account Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMigrationFlag();
    setMigrationCallback(null as any);
  });

  const mockCredentials = {
    accessToken: 'access-token',
    idToken: 'user-id-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    scope: 'openid profile email',
  };

  describe('setMigrationCallback', () => {
    it('should register migration callback', () => {
      const callback: MigrationCallback = jest.fn();
      setMigrationCallback(callback);
    });
  });

  describe('checkAndMigrate', () => {
    it('should return false when no anonymous ID exists', async () => {
      (loadAnonymousId as jest.Mock).mockResolvedValue(null);

      const result = await checkAndMigrate();

      expect(result).toBe(false);
    });

    it('should return false when no credentials exist', async () => {
      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockRejectedValue(new Error('No credentials'));

      const result = await checkAndMigrate();

      expect(result).toBe(false);
    });

    it('should invoke callback and clear anonymous ID on success', async () => {
      const callback = jest.fn().mockResolvedValue(undefined);
      setMigrationCallback(callback);

      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockResolvedValue(mockCredentials);

      const result = await checkAndMigrate();

      expect(result).toBe(true);
      expect(callback).toHaveBeenCalledWith('anon-123', mockCredentials.idToken);
      expect(clearAnonymousIdWithCache).toHaveBeenCalled();
    });

    it('should not invoke callback or clear ID if none registered', async () => {
      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockResolvedValue(mockCredentials);

      const result = await checkAndMigrate();

      expect(result).toBe(true);
      expect(clearAnonymousIdWithCache).not.toHaveBeenCalled();
    });

    it('should rethrow error if callback fails', async () => {
      const callback = jest.fn().mockRejectedValue(new Error('Migration failed'));
      setMigrationCallback(callback);

      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockResolvedValue(mockCredentials);

      const result = await checkAndMigrate();
      
      expect(result).toBe(false);
      expect(clearAnonymousIdWithCache).not.toHaveBeenCalled();
    });

    it('should only attempt migration once', async () => {
      const callback = jest.fn().mockResolvedValue(undefined);
      setMigrationCallback(callback);

      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockResolvedValue(mockCredentials);

      await checkAndMigrate();
      await checkAndMigrate();
      await checkAndMigrate();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow retry after resetMigrationFlag', async () => {
      const callback = jest.fn().mockResolvedValue(undefined);
      setMigrationCallback(callback);

      (loadAnonymousId as jest.Mock).mockResolvedValue('anon-123');
      (getCredentials as jest.Mock).mockResolvedValue(mockCredentials);

      await checkAndMigrate();
      resetMigrationFlag();
      await checkAndMigrate();

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetMigrationFlag', () => {
    it('should reset the migration flag', () => {
      resetMigrationFlag();
    });
  });
});
