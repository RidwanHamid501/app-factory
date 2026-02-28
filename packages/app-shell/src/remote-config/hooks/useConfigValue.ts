import { useRemoteConfigStore } from '../remoteConfigStore';
import type { ConfigValue } from '../types';

// Hook to get typed config values - Official docs: https://rnfirebase.io/remote-config/usage
export function useConfigValue(key: string): ConfigValue | undefined {
  return useRemoteConfigStore((state) => state.getValue(key));
}

export function useConfigBoolean(key: string, defaultValue?: boolean): boolean {
  return useRemoteConfigStore((state) => state.getBoolean(key, defaultValue));
}

export function useConfigString(key: string, defaultValue?: string): string {
  return useRemoteConfigStore((state) => state.getString(key, defaultValue));
}

export function useConfigNumber(key: string, defaultValue?: number): number {
  return useRemoteConfigStore((state) => state.getNumber(key, defaultValue));
}
