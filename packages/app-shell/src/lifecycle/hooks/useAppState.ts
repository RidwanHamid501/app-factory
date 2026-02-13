// useAppState - Hooks for accessing and reacting to app state changes
// Uses useRef pattern for stable callback handling (React 19.1.0 compatible)

import { useEffect, useRef } from 'react';
import { useLifecycleStore } from '../LifecycleStore';
import { AppState } from '../types';

export function useAppState(): AppState {
  return useLifecycleStore((state) => state.currentState);
}

export function useAppActive(callback: () => void): void {
  const currentState = useAppState();
  const previousStateRef = useRef<AppState>(currentState);
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    if (previousStateRef.current !== 'active' && currentState === 'active') {
      callbackRef.current();
    }
    previousStateRef.current = currentState;
  }, [currentState]);
}

export function useAppBackground(callback: () => void): void {
  const currentState = useAppState();
  const previousStateRef = useRef<AppState>(currentState);
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;

  useEffect(() => {
    if (previousStateRef.current !== 'background' && currentState === 'background') {
      callbackRef.current();
    }
    previousStateRef.current = currentState;
  }, [currentState]);
}
