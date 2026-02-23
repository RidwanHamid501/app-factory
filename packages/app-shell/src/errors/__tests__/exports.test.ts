// Test file to verify all error boundary exports are accessible
import {
  ErrorBoundary,
  ErrorFallback,
  useErrorHandler,
  useErrorReset,
  type ErrorBoundaryConfig,
  type ErrorFallbackProps,
  type SentryConfig,
} from '../index';

describe('Error Boundary Public API', () => {
  describe('Component Exports', () => {
    it('should export ErrorBoundary component', () => {
      expect(ErrorBoundary).toBeDefined();
      expect(typeof ErrorBoundary).toBe('function');
    });

    it('should export ErrorFallback component', () => {
      expect(ErrorFallback).toBeDefined();
      expect(typeof ErrorFallback).toBe('function');
    });
  });

  describe('Hook Exports', () => {
    it('should export useErrorHandler hook', () => {
      expect(useErrorHandler).toBeDefined();
      expect(typeof useErrorHandler).toBe('function');
    });

    it('should export useErrorReset hook', () => {
      expect(useErrorReset).toBeDefined();
      expect(typeof useErrorReset).toBe('function');
    });
  });

  describe('Type Exports', () => {
    it('should have ErrorBoundaryConfig type available', () => {
      const config: ErrorBoundaryConfig = {
        showDetailedError: true,
      };
      expect(config).toBeDefined();
    });

    it('should have SentryConfig type available', () => {
      const sentryConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      };
      expect(sentryConfig).toBeDefined();
    });

    it('should have ErrorFallbackProps type available', () => {
      const mockProps: ErrorFallbackProps = {
        error: new Error('Test'),
        resetErrorBoundary: jest.fn(),
        isDevelopment: true,
      };
      expect(mockProps).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should enforce SentryConfig required properties', () => {
      // DSN is required
      const validConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
      };
      expect(validConfig.dsn).toBe('https://test@sentry.io/123');
    });

    it('should allow optional SentryConfig properties', () => {
      const fullConfig: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'production',
        release: '1.0.0',
        dist: 'abc123',
        debug: false,
        sampleRate: 0.5,
        maxBreadcrumbs: 50,
        enabled: true,
      };
      expect(fullConfig).toBeDefined();
    });

    it('should allow ErrorBoundaryConfig with all options', () => {
      const fullConfig: ErrorBoundaryConfig = {
        fallback: ErrorFallback,
        sentry: {
          dsn: 'https://test@sentry.io/123',
        },
        onError: jest.fn(),
        onReset: jest.fn(),
        resetKeys: ['key1', 'key2'],
        showDetailedError: true,
      };
      expect(fullConfig).toBeDefined();
    });

    it('should allow minimal ErrorBoundaryConfig', () => {
      const minimalConfig: ErrorBoundaryConfig = {};
      expect(minimalConfig).toBeDefined();
    });
  });
});
