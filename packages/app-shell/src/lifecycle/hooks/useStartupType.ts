// useStartupType - Hooks for detecting cold vs warm start

import { useLifecycleStore } from '../LifecycleStore';
import { StartupType } from '../types';

export function useStartupType(): StartupType {
  return useLifecycleStore((state) => state.startupType);
}

export function useColdStart(): boolean {
  return useStartupType() === 'cold';
}

export function useWarmStart(): boolean {
  return useStartupType() === 'warm';
}
