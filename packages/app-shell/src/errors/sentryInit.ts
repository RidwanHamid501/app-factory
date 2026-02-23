import { Logger } from '../utils/logger';
import type { SentryConfig } from './types';

let sentryInitialized = false;
let sentryInstance: any = null;

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
    sentryInstance = require('@sentry/react-native');
    
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
          componentStack: errorInfo.componentStack,
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
