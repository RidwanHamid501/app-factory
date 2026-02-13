// Lifecycle Types - Matches React Native AppState API: https://reactnative.dev/docs/appstate

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
