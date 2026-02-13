// LifecycleStore - Zustand store for lifecycle state
// Docs: https://zustand.docs.pmnd.rs/guides/typescript

import { create } from 'zustand';
import { LifecycleState, AppState, StartupType } from './types';
import { generateSessionId } from '../utils/session';

interface LifecycleStore extends LifecycleState {
  setAppState: (state: AppState) => void;
  setStartupType: (type: StartupType) => void;
  startNewSession: () => void;
  recordBackgroundTransition: () => void;
  recordActiveTransition: () => void;
}

// Using create<T>()(...) pattern - double parentheses required for TypeScript
export const useLifecycleStore = create<LifecycleStore>()((set, get) => ({
  currentState: 'unknown',
  previousState: null,
  startupType: 'cold',
  startupTimestamp: Date.now(),
  sessionId: generateSessionId(),
  sessionStartTime: Date.now(),
  lastActiveTimestamp: Date.now(),
  lastBackgroundTimestamp: 0,
  backgroundDuration: 0,

  setAppState: (state: AppState) => {
    const current = get().currentState;
    set({
      currentState: state,
      previousState: current,
    });
  },

  setStartupType: (type: StartupType) => {
    set({ startupType: type });
  },

  startNewSession: () => {
    set({
      sessionId: generateSessionId(),
      sessionStartTime: Date.now(),
    });
  },

  recordBackgroundTransition: () => {
    set({
      lastBackgroundTimestamp: Date.now(),
    });
  },

  recordActiveTransition: () => {
    const now = Date.now();
    const { lastBackgroundTimestamp } = get();
    const duration = lastBackgroundTimestamp > 0 ? now - lastBackgroundTimestamp : 0;
    
    set({
      lastActiveTimestamp: now,
      backgroundDuration: duration,
    });
  },
}));
