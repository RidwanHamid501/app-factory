import { create } from 'zustand';
import { Logger } from '../utils/logger';
import type { LoadingState } from './types';

interface LoadingStore extends LoadingState {
  startInitialization: () => void;
  completeTask: (taskId: string) => void;
  failTask: (taskId: string) => void;
  setCurrentTask: (taskId: string | null) => void;
  markAppReady: () => void;
  reset: () => void;
}

const initialState: LoadingState = {
  isInitializing: true,
  isAppReady: false,
  completedTasks: [],
  failedTasks: [],
  currentTask: null,
};

// Loading state store - Official docs: https://zustand.docs.pmnd.rs/
export const useLoadingStore = create<LoadingStore>()((set) => ({
  ...initialState,

  startInitialization: () => {
    Logger.info('[LoadingStore] Starting initialization');
    set({ isInitializing: true, isAppReady: false });
  },

  completeTask: (taskId: string) => {
    Logger.debug('[LoadingStore] Task completed:', taskId);
    set((state) => ({
      completedTasks: [...state.completedTasks, taskId],
      currentTask: state.currentTask === taskId ? null : state.currentTask,
    }));
  },

  failTask: (taskId: string) => {
    Logger.warn('[LoadingStore] Task failed:', taskId);
    set((state) => ({
      failedTasks: [...state.failedTasks, taskId],
      currentTask: state.currentTask === taskId ? null : state.currentTask,
    }));
  },

  setCurrentTask: (taskId: string | null) => {
    set({ currentTask: taskId });
  },

  markAppReady: () => {
    Logger.info('[LoadingStore] App marked as ready');
    set({ isInitializing: false, isAppReady: true, currentTask: null });
  },

  reset: () => {
    set(initialState);
  },
}));
