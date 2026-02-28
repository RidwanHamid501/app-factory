// Remote config provider configuration - Official docs: https://rnfirebase.io/remote-config/usage
export interface RemoteConfigConfig {
  defaults?: Record<string, ConfigValue>;
  fetchTimeoutMillis?: number;
  minimumFetchIntervalMillis?: number;
  enableRealtime?: boolean;
  onFetchSuccess?: (config: RemoteConfigSnapshot) => void;
  onFetchError?: (error: Error) => void;
  onActivate?: (config: RemoteConfigSnapshot) => void;
}

// Supported configuration value types
export type ConfigValue = string | number | boolean;

// Remote config snapshot
export interface RemoteConfigSnapshot {
  values: Record<string, ConfigValue>;
  source: 'default' | 'cache' | 'remote';
  lastFetchTime: number | null;
  lastFetchStatus: 'success' | 'failure' | 'throttled' | 'no-fetch-yet';
}

// Remote config state
export interface RemoteConfigState {
  isInitialized: boolean;
  isFetching: boolean;
  config: RemoteConfigSnapshot;
  error: Error | null;
}

// Feature flag definition
export interface FeatureFlag {
  enabled: boolean;
  variant?: string;
  metadata?: Record<string, ConfigValue>;
}
