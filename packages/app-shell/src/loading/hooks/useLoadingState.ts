import { useLoadingStore } from '../loadingStore';

// Hook to access loading state - Official docs: https://zustand.docs.pmnd.rs/
export function useLoadingState() {
  const state = useLoadingStore();

  return {
    isInitializing: state.isInitializing,
    isAppReady: state.isAppReady,
    completedTasks: state.completedTasks,
    failedTasks: state.failedTasks,
    currentTask: state.currentTask,
    completedCount: state.completedTasks.length,
    failedCount: state.failedTasks.length,
  };
}
