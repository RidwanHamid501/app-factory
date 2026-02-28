import { Logger } from '../utils/logger';
import type { SentryConfig } from './types';

type SentryModule = {
  init: (config: {
    dsn: string;
    environment?: string;
    release?: string;
    dist?: string;
    debug?: boolean;
    tracesSampleRate?: number;
    maxBreadcrumbs?: number;
  }) => void;
  captureException: (error: Error, context?: { contexts?: { react?: { componentStack?: string } } }) => void;
} | null;

let sentryInitialized = false;
let sentryInstance: SentryModule = null;

// Initialize Sentry with user config - Official docs: https://docs.sentry.io/platforms/react-native/
export function initializeSentry(config: SentryConfig): void {
  if (sentryInitialized) {
    Logger.warn('[Sentry] Already initialized, skipping');
    return;
  }

  if (config.enabled === false) {
    Logger.info('[Sentry] Disabled via config');
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sentry = require('@sentry/react-native') as SentryModule;
    sentryInstance = sentry;
    
    if (sentryInstance) {
      sentryInstance.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        dist: config.dist,
        debug: config.debug ?? __DEV__,
        tracesSampleRate: config.sampleRate ?? 1.0,
        maxBreadcrumbs: config.maxBreadcrumbs ?? 100,
      });

      sentryInitialized = true;
      Logger.info('[Sentry] Initialized successfully');
    }
  } catch (error) {
    Logger.error('[Sentry] Failed to initialize:', error);
    sentryInstance = null;
  }
}

// Capture exception to Sentry - Official docs: https://docs.sentry.io/platforms/react-native/usage/
export function captureSentryException(
  error: Error,
  errorInfo: React.ErrorInfo
): void {
  if (!sentryInstance) {
    Logger.debug('[Sentry] Not available, skipping error capture');
    return;
  }

  try {
    sentryInstance.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack ?? '',
        },
      },
    });
  } catch (err) {
    Logger.error('[Sentry] Failed to capture exception:', err);
  }
}

export function isSentryInitialized(): boolean {
  return sentryInitialized;
}

// Reset state for testing
export function __resetSentryForTesting(): void {
  sentryInitialized = false;
  sentryInstance = null;
}
