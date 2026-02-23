import { useCallback } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { Logger } from '../../utils/logger';

// Hook to reset error boundary state - Official docs: https://github.com/bvaughn/react-error-boundary#useerrorboundary
export function useErrorReset() {
  const { resetBoundary } = useErrorBoundary();

  const resetError = useCallback(() => {
    Logger.info('[useErrorReset] Resetting error boundary');
    resetBoundary();
  }, [resetBoundary]);

  return { resetError };
}
