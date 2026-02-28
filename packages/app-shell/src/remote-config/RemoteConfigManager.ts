import { Logger } from '../utils/logger';
import type { RemoteConfigConfig, RemoteConfigSnapshot, ConfigValue } from './types';

// Type definitions for Firebase Remote Config modular API
type RemoteConfigInstance = unknown;
type GetRemoteConfigFn = () => RemoteConfigInstance;
type SetDefaultsFn = (instance: RemoteConfigInstance, defaults: Record<string, ConfigValue>) => Promise<void>;
type SetConfigSettingsFn = (instance: RemoteConfigInstance, settings: { fetchTimeoutMillis: number; minimumFetchIntervalMillis: number }) => Promise<void>;
type ActivateFn = (instance: RemoteConfigInstance) => Promise<boolean>;
type FetchAndActivateFn = (instance: RemoteConfigInstance) => Promise<boolean>;
type GetAllFn = (instance: RemoteConfigInstance) => Record<string, unknown>;
type OnConfigUpdatedFn = (instance: RemoteConfigInstance, callback: () => void) => () => void;

let remoteConfigInstance: RemoteConfigInstance | null = null;
let realtimeUnsubscribe: (() => void) | null = null;

// Firebase modular API functions - Official docs: https://rnfirebase.io/migrating-to-v22
let getRemoteConfigFn: GetRemoteConfigFn | null = null;
let setDefaultsFn: SetDefaultsFn | null = null;
let setConfigSettingsFn: SetConfigSettingsFn | null = null;
let activateFn: ActivateFn | null = null;
let fetchAndActivateFn: FetchAndActivateFn | null = null;
let getAllFn: GetAllFn | null = null;
let onConfigUpdatedFn: OnConfigUpdatedFn | null = null;

function loadFirebaseModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('@react-native-firebase/remote-config');
    
    // Load modular API functions - Official docs: https://rnfirebase.io/migrating-to-v22
    getRemoteConfigFn = module.getRemoteConfig;
    setDefaultsFn = module.setDefaults;
    setConfigSettingsFn = module.setConfigSettings;
    activateFn = module.activate;
    fetchAndActivateFn = module.fetchAndActivate;
    getAllFn = module.getAll;
    onConfigUpdatedFn = module.onConfigUpdated;
    
    Logger.debug('[RemoteConfigManager] Firebase Remote Config module loaded');
    return true;
  } catch {
    Logger.warn('[RemoteConfigManager] Firebase Remote Config not installed');
    return false;
  }
}

// Initialize Firebase Remote Config instance - Official docs: https://rnfirebase.io/migrating-to-v22
function getRemoteConfig() {
  if (!remoteConfigInstance) {
    if (!getRemoteConfigFn && !loadFirebaseModule()) {
      return null;
    }
    
    try {
      // Firebase auto-initializes from google-services.json via the Google Services Gradle plugin
      if (!getRemoteConfigFn) {
        Logger.error('[RemoteConfigManager] getRemoteConfig function not available');
        return null;
      }
      
      remoteConfigInstance = getRemoteConfigFn();
      Logger.debug('[RemoteConfigManager] Firebase Remote Config initialized');
    } catch (error) {
      Logger.error('[RemoteConfigManager] Failed to initialize Remote Config:', error);
      remoteConfigInstance = null;
    }
  }
  return remoteConfigInstance;
}

// Initialize remote config with defaults - Official docs: https://rnfirebase.io/remote-config/usage
export async function initialize(
  config: RemoteConfigConfig
): Promise<RemoteConfigSnapshot> {
  const remoteConfig = getRemoteConfig();
  
  // If Firebase not available, return defaults
  if (!remoteConfig) {
    Logger.debug('[RemoteConfigManager] Firebase not available, using defaults');
    return {
      values: config.defaults || {},
      source: 'default',
      lastFetchTime: null,
      lastFetchStatus: 'no-fetch-yet',
    };
  }

  try {
    // Set default values - Official docs: https://rnfirebase.io/remote-config/usage#setdefaults
    if (config.defaults && setDefaultsFn) {
      await setDefaultsFn(remoteConfig, config.defaults);
      Logger.debug('[RemoteConfigManager] Set default values');
    }

    // Configure fetch settings - Official docs: https://rnfirebase.io/remote-config/usage#settings
    if (setConfigSettingsFn) {
      await setConfigSettingsFn(remoteConfig, {
        fetchTimeoutMillis: config.fetchTimeoutMillis || 60000,
        minimumFetchIntervalMillis: config.minimumFetchIntervalMillis || 3600000, // 1 hour
      });
    }

    // Activate any previously fetched configs - Firebase handles caching automatically
    // Official docs: https://rnfirebase.io/remote-config/usage#activate
    if (activateFn) {
      await activateFn(remoteConfig);
    }
    
    const values = getAllValues(remoteConfig);
    
    // Determine source: check if any values are from remote (meaning Firebase has cached data)
    const allEntries = getAllFn ? getAllFn(remoteConfig) : {};
    const hasRemoteValues = Object.values(allEntries).some(
      (entry: unknown) => {
        const configEntry = entry as { getSource?: () => string };
        return configEntry?.getSource?.() === 'remote';
      }
    );
    
    const source = hasRemoteValues ? 'cache' : 'default';
    Logger.info(`[RemoteConfigManager] Initialized with ${source} values`);

    return {
      values,
      source,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success',
    };
  } catch (error) {
    Logger.error('[RemoteConfigManager] Initialization failed:', error);
    return {
      values: config.defaults || {},
      source: 'default',
      lastFetchTime: null,
      lastFetchStatus: 'failure',
    };
  }
}

// Fetch and activate new config - Official docs: https://rnfirebase.io/remote-config/usage#fetchandactivate
export async function fetchAndActivate(
  config: RemoteConfigConfig
): Promise<RemoteConfigSnapshot> {
  const remoteConfig = getRemoteConfig();
  
  if (!remoteConfig || !fetchAndActivateFn) {
    Logger.debug('[RemoteConfigManager] Firebase not available');
    return {
      values: config.defaults || {},
      source: 'default',
      lastFetchTime: null,
      lastFetchStatus: 'no-fetch-yet',
    };
  }

  try {
    // Fetch and activate in one call - Firebase caches automatically
    // Official docs: https://rnfirebase.io/remote-config/usage#fetchandactivate
    const activated = await fetchAndActivateFn(remoteConfig);
    
    const values = getAllValues(remoteConfig);
    
    Logger.info('[RemoteConfigManager] Fetched and activated', { activated });
    
    const snapshot: RemoteConfigSnapshot = {
      values,
      source: 'remote',
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success',
    };
    
    config.onFetchSuccess?.(snapshot);
    config.onActivate?.(snapshot);
    
    return snapshot;
  } catch (error) {
    Logger.error('[RemoteConfigManager] Fetch failed:', error);
    config.onFetchError?.(error as Error);
    
    return {
      values: config.defaults || {},
      source: 'default',
      lastFetchTime: null,
      lastFetchStatus: 'failure',
    };
  }
}

// Enable real-time config updates - Official docs: https://rnfirebase.io/remote-config/usage#realtime
export function enableRealtime(
  config: RemoteConfigConfig,
  onUpdate: (snapshot: RemoteConfigSnapshot) => void
): void {
  const remoteConfig = getRemoteConfig();
  
  if (!remoteConfig || !onConfigUpdatedFn || !activateFn) {
    Logger.debug('[RemoteConfigManager] Real-time updates not available');
    return;
  }

  try {
    // Add real-time listener - Official docs: https://rnfirebase.io/remote-config/usage#realtime
    realtimeUnsubscribe = onConfigUpdatedFn(remoteConfig, async () => {
      Logger.info('[RemoteConfigManager] Real-time config update received');
      
      // activateFn is guaranteed to be non-null here due to check above
      if (activateFn) {
        await activateFn(remoteConfig);
      }
      const values = getAllValues(remoteConfig);
      
      const snapshot: RemoteConfigSnapshot = {
        values,
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      };
      
      onUpdate(snapshot);
      config.onActivate?.(snapshot);
    });
    
    Logger.info('[RemoteConfigManager] Real-time updates enabled');
  } catch (error) {
    Logger.error('[RemoteConfigManager] Failed to enable real-time updates:', error);
  }
}

// Disable real-time updates
export function disableRealtime(): void {
  if (realtimeUnsubscribe) {
    realtimeUnsubscribe();
    realtimeUnsubscribe = null;
    Logger.info('[RemoteConfigManager] Real-time updates disabled');
  }
}

// Get all config values - Official docs: https://rnfirebase.io/remote-config/usage#reading-values
function getAllValues(
  remoteConfigInstance: unknown
): Record<string, ConfigValue> {
  if (!getAllFn) {
    return {};
  }
  
  const allValues = getAllFn(remoteConfigInstance) as Record<string, unknown>;
  const values: Record<string, ConfigValue> = {};

  for (const [key, entry] of Object.entries(allValues)) {
    const configEntry = entry as { 
      getSource: () => string; 
      asString: () => string;
    };
    const source = configEntry.getSource();
    if (source === 'default' || source === 'remote') {
      values[key] = configEntry.asString();
    }
  }

  return values;
}

export function __resetManagerForTesting(): void {
  remoteConfigInstance = null;
  realtimeUnsubscribe = null;
}
