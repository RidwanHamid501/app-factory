/* eslint-disable @typescript-eslint/no-require-imports */
import { initializeSentry, captureSentryException, isSentryInitialized, __resetSentryForTesting } from '../sentryInit';
import { Logger } from '../../utils/logger';
import type { SentryConfig } from '../types';

jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('sentryInit', () => {
  let mockSentry: { init: jest.Mock; captureException: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    __resetSentryForTesting();
    mockSentry = require('@sentry/react-native');
  });

  describe('initializeSentry', () => {
    const validConfig: SentryConfig = {
      dsn: 'https://test@sentry.io/123',
      environment: 'test',
      release: '1.0.0',
    };

    it('should initialize Sentry with valid config', () => {
      initializeSentry(validConfig);

      expect(mockSentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        release: '1.0.0',
        dist: undefined,
        debug: true,
        tracesSampleRate: 1.0,
        maxBreadcrumbs: 100,
      });
      expect(Logger.info).toHaveBeenCalledWith('[Sentry] Initialized successfully');
      expect(isSentryInitialized()).toBe(true);
    });

    it('should use default values for optional config', () => {
      const minimalConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
      };

      initializeSentry(minimalConfig);

      expect(mockSentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: undefined,
        release: undefined,
        dist: undefined,
        debug: true,
        tracesSampleRate: 1.0,
        maxBreadcrumbs: 100,
      });
    });

    it('should respect custom sample rate and breadcrumbs', () => {
      const customConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        sampleRate: 0.5,
        maxBreadcrumbs: 50,
      };

      initializeSentry(customConfig);

      expect(mockSentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: undefined,
        release: undefined,
        dist: undefined,
        debug: true,
        tracesSampleRate: 0.5,
        maxBreadcrumbs: 50,
      });
    });

    it('should skip initialization if enabled is false', () => {
      const disabledConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        enabled: false,
      };

      initializeSentry(disabledConfig);

      expect(mockSentry.init).not.toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledWith('[Sentry] Disabled via config');
      expect(isSentryInitialized()).toBe(false);
    });

    it('should skip second initialization attempt', () => {
      initializeSentry(validConfig);
      jest.clearAllMocks();

      initializeSentry(validConfig);

      expect(mockSentry.init).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith('[Sentry] Already initialized, skipping');
    });

    it('should handle initialization errors gracefully', () => {
      mockSentry.init.mockImplementationOnce(() => {
        throw new Error('Init failed');
      });

      initializeSentry(validConfig);

      expect(Logger.error).toHaveBeenCalledWith('[Sentry] Failed to initialize:', expect.any(Error));
      expect(isSentryInitialized()).toBe(false);
    });
  });

  describe('captureSentryException', () => {
    const mockError = new Error('Test error');
    const mockErrorInfo = {
      componentStack: '\n    at Component\n    at App',
    };

    beforeEach(() => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
      };
      initializeSentry(config);
      jest.clearAllMocks();
    });

    it('should capture exception with component stack', () => {
      captureSentryException(mockError, mockErrorInfo);

      expect(mockSentry.captureException).toHaveBeenCalledWith(mockError, {
        contexts: {
          react: {
            componentStack: '\n    at Component\n    at App',
          },
        },
      });
    });

    it('should handle capture errors gracefully', () => {
      mockSentry.captureException.mockImplementationOnce(() => {
        throw new Error('Capture failed');
      });

      captureSentryException(mockError, mockErrorInfo);

      expect(Logger.error).toHaveBeenCalledWith(
        '[Sentry] Failed to capture exception:',
        expect.any(Error)
      );
    });
  });

  describe('isSentryInitialized', () => {
    it('should return false before initialization', () => {
      expect(isSentryInitialized()).toBe(false);
    });

    it('should return true after successful initialization', () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
      };
      initializeSentry(config);

      expect(isSentryInitialized()).toBe(true);
    });

    it('should return false if initialization was disabled', () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        enabled: false,
      };
      initializeSentry(config);

      expect(isSentryInitialized()).toBe(false);
    });
  });
});
