import { useCallback } from 'react';
import { hideSplash, isSplashVisible } from '../SplashController';
import type { SplashOptions } from '../types';

// Hook to control splash screen - Official docs: https://react.dev/reference/react/useCallback
export function useSplashControl() {
  const hide = useCallback(async (options?: SplashOptions) => {
    await hideSplash(options);
  }, []);

  const isVisible = useCallback(() => {
    return isSplashVisible();
  }, []);

  return {
    hideSplash: hide,
    isSplashVisible: isVisible,
  };
}
