import { useLoadingStore } from '../loadingStore';

// Hook to check if app is ready - Official docs: https://zustand.docs.pmnd.rs/
export function useAppReady() {
  const isAppReady = useLoadingStore((state) => state.isAppReady);
  const isInitializing = useLoadingStore((state) => state.isInitializing);

  return {
    isAppReady,
    isInitializing,
  };
}
