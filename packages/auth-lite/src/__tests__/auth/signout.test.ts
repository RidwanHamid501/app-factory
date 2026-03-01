import { signOut } from '../../auth/signout';
import { clearCredentials } from '../../credentials/storage';

jest.mock('../../credentials/storage');
jest.mock('../../auth/services/auth0Service');
jest.mock('../../auth/config', () => ({
  getAuth0Config: jest.fn(() => ({
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
    scheme: 'myapp',
  })),
}));
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Sign Out', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signOut', () => {
    it('should clear credentials on sign out', async () => {
      await signOut();

      expect(clearCredentials).toHaveBeenCalled();
    });

    it('should throw error if clearCredentials fails', async () => {
      (clearCredentials as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(signOut()).rejects.toThrow();
    });

    it('should succeed even if no credentials exist', async () => {
      (clearCredentials as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(signOut()).resolves.not.toThrow();
    });
  });
});
