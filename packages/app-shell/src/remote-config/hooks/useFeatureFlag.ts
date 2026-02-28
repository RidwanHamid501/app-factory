import { useRemoteConfigStore } from '../remoteConfigStore';
import type { FeatureFlag } from '../types';

// Hook to check remote config feature flags - Official docs: https://firebase.google.com/docs/remote-config/api-overview
export function useRemoteFeatureFlag(flagKey: string): FeatureFlag {
  const getBoolean = useRemoteConfigStore((state) => state.getBoolean);
  const getString = useRemoteConfigStore((state) => state.getString);
  const getValue = useRemoteConfigStore((state) => state.getValue);

  const enabled = getBoolean(flagKey, false);
  const variant = getString(`${flagKey}_variant`, undefined);
  
  // Check for any metadata keys (e.g., flagKey_metadata_*)
  const config = useRemoteConfigStore((state) => state.config);
  const metadata: Record<string, string | number | boolean> = {};
  const metadataPrefix = `${flagKey}_metadata_`;
  
  Object.keys(config.values).forEach((key) => {
    if (key.startsWith(metadataPrefix)) {
      const metadataKey = key.substring(metadataPrefix.length);
      const value = getValue(key);
      if (value !== undefined) {
        metadata[metadataKey] = value;
      }
    }
  });

  return {
    enabled,
    variant: variant || undefined,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
