// Integration test to verify error boundaries work from main package export
import {
  ErrorBoundary,
  ErrorFallback,
  useErrorHandler,
  useErrorReset,
  type ErrorBoundaryConfig,
  type SentryConfig,
} from '../index';

describe('Error Boundaries - Main Package Integration', () => {
  it('should export ErrorBoundary from main package', () => {
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe('function');
  });

  it('should export ErrorFallback from main package', () => {
    expect(ErrorFallback).toBeDefined();
    expect(typeof ErrorFallback).toBe('function');
  });

  it('should export useErrorHandler from main package', () => {
    expect(useErrorHandler).toBeDefined();
    expect(typeof useErrorHandler).toBe('function');
  });

  it('should export useErrorReset from main package', () => {
    expect(useErrorReset).toBeDefined();
    expect(typeof useErrorReset).toBe('function');
  });

  it('should have proper TypeScript types from main package', () => {
    // Type check - this will fail at compile time if types aren't exported
    const config: ErrorBoundaryConfig = {
      sentry: {
        dsn: 'https://test@sentry.io/123',
      },
    };

    const sentryConfig: SentryConfig = {
      dsn: 'https://test@sentry.io/123',
      environment: 'production',
    };

    expect(config).toBeDefined();
    expect(sentryConfig).toBeDefined();
  });
});
