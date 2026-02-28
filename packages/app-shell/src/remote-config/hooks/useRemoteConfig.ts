import { useRemoteConfigStore } from '../remoteConfigStore';

// Hook to access remote config state - Official docs: https://zustand.docs.pmnd.rs/
export function useRemoteConfig() {
  const isInitialized = useRemoteConfigStore((state) => state.isInitialized);
  const isFetching = useRemoteConfigStore((state) => state.isFetching);
  const config = useRemoteConfigStore((state) => state.config);
  const error = useRemoteConfigStore((state) => state.error);

  return {
    isInitialized,
    isFetching,
    config,
    error,
    source: config.source,
    lastFetchTime: config.lastFetchTime,
    lastFetchStatus: config.lastFetchStatus,
  };
}
