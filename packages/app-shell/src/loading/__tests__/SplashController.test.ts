// Mock modules at the top level
jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock react-native-bootsplash
let mockBootsplash: any = {
  hide: jest.fn().mockResolvedValue(undefined),
  isVisible: jest.fn().mockReturnValue(true),
};

jest.mock('react-native-bootsplash', () => mockBootsplash, { virtual: true });

describe('SplashController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    mockBootsplash = {
      hide: jest.fn().mockResolvedValue(undefined),
      isVisible: jest.fn().mockReturnValue(true),
    };
  });

  describe('hideSplash', () => {
    describe('Success Cases', () => {
      it('successfully hides splash with default options', async () => {
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await hideSplash();

        expect(mockBootsplash.hide).toHaveBeenCalledWith({
          fade: true,
          duration: 250,
        });
      });

      it('successfully hides splash with custom options', async () => {
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await hideSplash({ fade: false, duration: 500 });

        expect(mockBootsplash.hide).toHaveBeenCalledWith({
          fade: false,
          duration: 500,
        });
      });

      it('prevents duplicate hide calls', async () => {
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await hideSplash();
        await hideSplash();

        expect(mockBootsplash.hide).toHaveBeenCalledTimes(1);
      });
    });

    describe('Failure Cases', () => {
      it('handles hide errors gracefully', async () => {
        const error = new Error('Hide failed');
        mockBootsplash.hide = jest.fn().mockRejectedValue(error);
        
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await expect(hideSplash()).resolves.not.toThrow();
      });
    });

    describe('Semantic Tests', () => {
      it('ensures splash hiding is idempotent', async () => {
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await hideSplash();
        await hideSplash();
        await hideSplash();

        expect(mockBootsplash.hide).toHaveBeenCalledTimes(1);
      });

      it('merges user options with defaults correctly', async () => {
        const { hideSplash, __resetSplashForTesting } = require('../SplashController');
        __resetSplashForTesting();

        await hideSplash({ fade: false });

        expect(mockBootsplash.hide).toHaveBeenCalledWith({
          fade: false,
          duration: 250,
        });
      });
    });
  });

  describe('isSplashVisible', () => {
    describe('Success Cases', () => {
      it('correctly reports splash visibility when true', () => {
        mockBootsplash.isVisible = jest.fn().mockReturnValue(true);
        const { isSplashVisible } = require('../SplashController');

        expect(isSplashVisible()).toBe(true);
      });

      it('correctly reports splash visibility when false', () => {
        mockBootsplash.isVisible = jest.fn().mockReturnValue(false);
        const { isSplashVisible } = require('../SplashController');

        expect(isSplashVisible()).toBe(false);
      });
    });

    describe('Failure Cases', () => {
      it('returns false when isVisible check fails', () => {
        mockBootsplash.isVisible = jest.fn().mockImplementation(() => {
          throw new Error('Check failed');
        });
        
        jest.resetModules();
        const { isSplashVisible } = require('../SplashController');

        expect(isSplashVisible()).toBe(false);
      });
    });

    describe('Semantic Tests', () => {
      it('is synchronous as per v7.x API', () => {
        const { isSplashVisible } = require('../SplashController');

        const result = isSplashVisible();
        expect(typeof result).toBe('boolean');
        expect(result).not.toBeInstanceOf(Promise);
      });
    });
  });
});
