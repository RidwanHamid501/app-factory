import React, { useCallback, useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { ErrorInfo as ReactErrorInfo } from 'react';
import { ErrorFallback } from './ErrorFallback';
import { initializeSentry, captureSentryException } from './sentryInit';
import { Logger } from '../utils/logger';
import type { ErrorBoundaryConfig } from './types';

// Global error boundary with config-based Sentry integration - Official docs: https://github.com/bvaughn/react-error-boundary
export function ErrorBoundary({
  children,
  fallback,
  sentry,
  onError,
  onReset,
  resetKeys,
  showDetailedError = __DEV__,
  isDarkMode,
}: ErrorBoundaryConfig & { children: React.ReactNode }) {
  
  useEffect(() => {
    if (sentry) {
      initializeSentry(sentry);
    }
  }, [sentry]);

  const handleError = useCallback(
    (error: Error, errorInfo: ReactErrorInfo) => {
      Logger.error('[ErrorBoundary] Rendering error caught:', {
        message: error.message,
        componentStack: errorInfo.componentStack,
      });

      if (sentry) {
        captureSentryException(error, errorInfo);
      }

      if (onError) {
        onError(error, errorInfo);
      }
    },
    [sentry, onError]
  );

  const handleReset = useCallback(() => {
    Logger.info('[ErrorBoundary] Error boundary reset');

    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const FallbackComponent = fallback || ErrorFallback;

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <FallbackComponent {...props} isDevelopment={showDetailedError} isDarkMode={isDarkMode} />
      )}
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
}
