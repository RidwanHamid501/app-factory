import { useAdapterRegistry } from '../AdapterRegistry';
import type { AdapterConfig } from '../types';

export function useAdapterConfig(): AdapterConfig {
  return useAdapterRegistry((state) => state.getConfig()) ?? {};
}

export function useAdapterTheme() {
  const config = useAdapterConfig();
  return config.theme ?? {};
}

export function useAdapterSettings() {
  const config = useAdapterConfig();
  return config.settings ?? {};
}

export function useAdapterStrings() {
  const config = useAdapterConfig();
  return config.strings ?? {};
}

export function useAdapterFeatureFlags() {
  const config = useAdapterConfig();
  return config.featureFlags ?? {};
}

export function useAdapterLinkingPrefixes() {
  const config = useAdapterConfig();
  return config.linkingPrefixes ?? [];
}
