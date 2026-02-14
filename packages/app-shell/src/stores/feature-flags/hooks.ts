import { useShallow } from 'zustand/react/shallow';
import { useFeatureFlagsStore } from './featureFlagsStore';
import { FeatureFlagValue } from './types';

export function useFeatureFlag(key: string): boolean {
  return useFeatureFlagsStore((state) => Boolean(state.flags[key]));
}

export function useFeatureFlagValue<T extends FeatureFlagValue>(
  key: string,
  defaultValue: T
): T {
  return useFeatureFlagsStore((state) => {
    const value = state.flags[key];
    return (value !== undefined ? value : defaultValue) as T;
  });
}

export function useFeatureFlags() {
  return useFeatureFlagsStore((state) => state.flags);
}

export function useFeatureFlagActions() {
  return useFeatureFlagsStore(
    useShallow((state) => ({
      setFlags: state.setFlags,
      setFlag: state.setFlag,
      resetFlags: state.resetFlags,
    }))
  );
}
