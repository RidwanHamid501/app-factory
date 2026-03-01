import { initializeAuth0, getAuth0Config } from '../../auth/config';

// Mock logger to prevent console output during tests
jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Auth0 Config', () => {
  beforeEach(() => {
    // Reset the module to clear the config state
    jest.resetModules();
    // Re-require the module to get fresh state
    jest.isolateModules(() => {
      require('../../auth/config');
    });
  });

  describe('initializeAuth0', () => {
    it('should initialize Auth0 with valid config', () => {
      const config = {
        domain: 'test.auth0.com',
        clientId: 'test-client-id',
        scheme: 'myapp',
      };

      expect(() => initializeAuth0(config)).not.toThrow();
    });

    it('should accept optional audience parameter', () => {
      const config = {
        domain: 'test.auth0.com',
        clientId: 'test-client-id',
        scheme: 'myapp',
        audience: 'https://api.example.com',
      };

      expect(() => initializeAuth0(config)).not.toThrow();
    });
  });

  describe('getAuth0Config', () => {
    it('should return config after initialization', () => {
      const config = {
        domain: 'test.auth0.com',
        clientId: 'test-client-id',
        scheme: 'myapp',
      };

      initializeAuth0(config);
      const retrieved = getAuth0Config();

      expect(retrieved).toEqual(config);
    });
  });
});
