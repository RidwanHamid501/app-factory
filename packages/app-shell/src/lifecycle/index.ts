// Lifecycle Module - Public exports

export { LifecycleProvider } from './LifecycleProvider';

export type {
  AppState,
  StartupType,
  LifecycleEvent,
  LifecycleState,
  LifecycleCallback,
  LifecycleSubscription,
  LifecycleConfig,
} from './types';

export { MAX_BACKGROUND_DURATION_MS } from './constants';

export { useLifecycleStore } from './LifecycleStore';
export { lifecycleManager } from './LifecycleManager';

export {
  useAppState,
  useAppActive,
  useAppBackground,
  useStartupType,
  useColdStart,
  useWarmStart,
} from './hooks';

