import { create } from 'zustand';
import { FeatureFlags, FeatureFlagValue } from './types';
import { Logger } from '../../utils/logger';

interface FeatureFlagsStore {
  flags: FeatureFlags;
  setFlags: (flags: FeatureFlags) => void;
  setFlag: (key: string, value: FeatureFlagValue) => void;
  resetFlags: () => void;
}

const defaultFlags: FeatureFlags = {
  'new_ui_enabled': false,
  'analytics_enabled': true,
  'beta_features': false,
};

export const useFeatureFlagsStore = create<FeatureFlagsStore>()((set) => ({
  flags: defaultFlags,
  
  setFlags: (flags: FeatureFlags) => {
    Logger.info('Setting feature flags', flags);
    set({ flags });
  },
  
  setFlag: (key: string, value: FeatureFlagValue) => {
    Logger.info(`Setting feature flag: ${key} = ${value}`);
    set((state) => ({
      flags: {
        ...state.flags,
        [key]: value,
      },
    }));
  },
  
  resetFlags: () => {
    Logger.info('Resetting feature flags to defaults');
    set({ flags: defaultFlags });
  },
}));
