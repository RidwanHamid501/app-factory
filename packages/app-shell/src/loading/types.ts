// Loading orchestration configuration - Official docs: https://github.com/zoontek/react-native-bootsplash
export interface LoadingConfig {
  splashMinDuration?: number;
  initializationTimeout?: number;
  tasks?: LoadingTask[];
  onReady?: () => void;
  onTimeout?: () => void;
}

// Represents an async initialization task
export interface LoadingTask {
  id: string;
  name: string;
  critical: boolean;
  timeout?: number;
  executor: () => Promise<void>;
}

// Loading state tracking
export interface LoadingState {
  isInitializing: boolean;
  isAppReady: boolean;
  completedTasks: string[];
  failedTasks: string[];
  currentTask: string | null;
}

// Splash screen control options - Official docs: https://github.com/zoontek/react-native-bootsplash#api
export interface SplashOptions {
  fade?: boolean;
  duration?: number;
}

// Loading overlay props
export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}
