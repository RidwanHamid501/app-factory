import { useCallback } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Logger } from '../../utils/logger';

// Hook to manually trigger error boundary - Official docs: https://github.com/bvaughn/react-error-boundary#useerrorboundary
export function useErrorHandler() {
  const { showBoundary } = useErrorBoundary();

  return useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      Logger.error('[useErrorHandler] Manually triggered error:', {
        message: error.message,
        context,
      });

      showBoundary(error);
    },
    [showBoundary]
  );
}
