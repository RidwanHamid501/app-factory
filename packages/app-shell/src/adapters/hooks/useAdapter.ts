import { useAdapterContext } from '../AdapterContext';
import type { AppAdapter } from '../types';

export function useAdapter(): AppAdapter | null {
  const { adapter } = useAdapterContext();
  return adapter;
}

export function useIsAdapterRegistered(): boolean {
  const { isRegistered } = useAdapterContext();
  return isRegistered;
}
