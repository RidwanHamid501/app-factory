import { create } from 'zustand';
import { Logger } from '../utils/logger';
import type { RemoteConfigState, RemoteConfigSnapshot, ConfigValue } from './types';

interface RemoteConfigStore extends RemoteConfigState {
  setInitialized: (initialized: boolean) => void;
  setFetching: (fetching: boolean) => void;
  setConfig: (config: RemoteConfigSnapshot) => void;
  setError: (error: Error | null) => void;
  getValue: (key: string) => ConfigValue | undefined;
  getBoolean: (key: string, defaultValue?: boolean) => boolean;
  getString: (key: string, defaultValue?: string) => string;
  getNumber: (key: string, defaultValue?: number) => number;
  reset: () => void;
}

const initialState: RemoteConfigState = {
  isInitialized: false,
  isFetching: false,
  config: {
    values: {},
    source: 'default',
    lastFetchTime: null,
    lastFetchStatus: 'no-fetch-yet',
  },
  error: null,
};

// Remote config store - Official docs: https://zustand.docs.pmnd.rs/
export const useRemoteConfigStore = create<RemoteConfigStore>()((set, get) => ({
  ...initialState,

  setInitialized: (initialized: boolean) => {
    Logger.debug('[RemoteConfigStore] Set initialized:', initialized);
    set({ isInitialized: initialized });
  },

  setFetching: (fetching: boolean) => {
    set({ isFetching: fetching });
  },

  setConfig: (config: RemoteConfigSnapshot) => {
    Logger.info('[RemoteConfigStore] Config updated:', {
      source: config.source,
      valueCount: Object.keys(config.values).length,
    });
    set({ config, error: null });
  },

  setError: (error: Error | null) => {
    if (error) {
      Logger.error('[RemoteConfigStore] Error:', error);
    }
    set({ error });
  },

  getValue: (key: string) => {
    return get().config.values[key];
  },

  getBoolean: (key: string, defaultValue: boolean = false) => {
    const value = get().config.values[key];
    if (value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  },

  getString: (key: string, defaultValue: string = '') => {
    const value = get().config.values[key];
    if (value === undefined) return defaultValue;
    return String(value);
  },

  getNumber: (key: string, defaultValue: number = 0) => {
    const value = get().config.values[key];
    if (value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  },

  reset: () => {
    set(initialState);
  },
}));
