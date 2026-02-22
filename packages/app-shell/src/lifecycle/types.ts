// Lifecycle Types - Official docs: https://reactnative.dev/docs/appstate

export type AppState = 'active' | 'background' | 'inactive' | 'unknown' | 'extension';

export type StartupType = 'cold' | 'warm';

export type LifecycleEvent = 
  | 'appStarting'
  | 'appActive'
  | 'appBackground'
  | 'appInactive';

export interface LifecycleState {
  currentState: AppState;
  previousState: AppState | null;
  startupType: StartupType;
  startupTimestamp: number;
  sessionId: string;
  sessionStartTime: number;
  lastActiveTimestamp: number;
  lastBackgroundTimestamp: number;
  backgroundDuration: number;
}

export type LifecycleCallback = () => void | Promise<void>;

export interface LifecycleSubscription {
  unsubscribe: () => void;
}

// Config-based lifecycle configuration
export interface LifecycleConfig {
  coldStartThreshold?: number;
  sessionTimeout?: number;
  onAppStarting?: LifecycleCallback;
  onAppActive?: LifecycleCallback;
  onAppBackground?: LifecycleCallback;
  onAppInactive?: LifecycleCallback;
  trackSessions?: boolean;
  autoInitialize?: boolean;
}
