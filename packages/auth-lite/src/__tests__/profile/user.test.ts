import { getUserProfile, getUserId, getUserEmail } from '../../profile/user';
import { getAccessToken } from '../../credentials/retrieval';
import { getUserInfo } from '../../auth/services/auth0Service';

jest.mock('../../credentials/retrieval');
jest.mock('../../auth/services/auth0Service');
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('User Profile', () => {
  const mockUserInfo = {
    sub: 'auth0|123456',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should fetch and return user profile', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce('access-token');
      (getUserInfo as jest.Mock).mockResolvedValueOnce(mockUserInfo);

      const profile = await getUserProfile();

      expect(getAccessToken).toHaveBeenCalled();
      expect(getUserInfo).toHaveBeenCalledWith('access-token');
      expect(profile).toEqual(mockUserInfo);
    });

    it('should return null when no access token', async () => {
      (getAccessToken as jest.Mock).mockRejectedValueOnce(
        new Error('No credentials found')
      );

      const profile = await getUserProfile();

      expect(profile).toBeNull();
    });

    it('should return null when getUserInfo fails', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce('access-token');
      (getUserInfo as jest.Mock).mockRejectedValueOnce(
        new Error('API error')
      );

      const profile = await getUserProfile();

      expect(profile).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return user ID from profile', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce('access-token');
      (getUserInfo as jest.Mock).mockResolvedValueOnce(mockUserInfo);

      const userId = await getUserId();

      expect(userId).toBe('auth0|123456');
    });

    it('should return null when profile fetch fails', async () => {
      (getAccessToken as jest.Mock).mockRejectedValueOnce(
        new Error('No credentials')
      );

      const userId = await getUserId();

      expect(userId).toBeNull();
    });
  });

  describe('getUserEmail', () => {
    it('should return user email from profile', async () => {
      (getAccessToken as jest.Mock).mockResolvedValueOnce('access-token');
      (getUserInfo as jest.Mock).mockResolvedValueOnce(mockUserInfo);

      const email = await getUserEmail();

      expect(email).toBe('test@example.com');
    });

    it('should return null when email not in profile', async () => {
      const profileWithoutEmail = { ...mockUserInfo, email: undefined };
      (getAccessToken as jest.Mock).mockResolvedValueOnce('access-token');
      (getUserInfo as jest.Mock).mockResolvedValueOnce(profileWithoutEmail);

      const email = await getUserEmail();

      expect(email).toBeNull();
    });

    it('should return null when profile fetch fails', async () => {
      (getAccessToken as jest.Mock).mockRejectedValueOnce(
        new Error('No credentials')
      );

      const email = await getUserEmail();

      expect(email).toBeNull();
    });
  });
});
