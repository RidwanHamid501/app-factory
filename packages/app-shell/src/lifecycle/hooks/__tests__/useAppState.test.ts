// useAppState.test.ts - Tests for app state hooks
// Official React Testing Library docs: https://testing-library.com/docs/react-native-testing-library/intro

import { renderHook, act } from '@testing-library/react-native';
import { useAppState, useAppActive, useAppBackground } from '../useAppState';
import { useLifecycleStore } from '../../LifecycleStore';
import type { AppState } from '../../types';

describe('useAppState hooks', () => {
  // Store reset handled automatically by __mocks__/zustand.ts

  describe('useAppState', () => {
    // Success test: returns current app state
    it('should return current app state', () => {
      const { result } = renderHook(() => useAppState());
      
      expect(result.current).toBe('unknown');
    });

    // Success test: updates when state changes
    it('should update when app state changes', () => {
      const { result } = renderHook(() => useAppState());
      
      expect(result.current).toBe('unknown');
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      expect(result.current).toBe('active');
    });

    // Success test: tracks all state transitions
    it('should track multiple state transitions', () => {
      const { result } = renderHook(() => useAppState());
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      expect(result.current).toBe('active');
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      expect(result.current).toBe('background');
      
      act(() => {
        useLifecycleStore.getState().setAppState('inactive');
      });
      expect(result.current).toBe('inactive');
    });
  });

  describe('useAppActive', () => {
    // Success test: calls callback on transition to active
    it('should call callback when app becomes active', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppActive(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    // Failure test: does not call on initial active state
    it('should not call callback if already active on mount', () => {
      const callback = jest.fn();
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      renderHook(() => useAppActive(callback));
      
      expect(callback).not.toHaveBeenCalled();
    });

    // Success test: only calls on transitions TO active
    it('should only fire on transition TO active, not while active', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppActive(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      // Should have been called once
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Setting to active again shouldn't call it
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    // Failure test: does not call on other state changes
    it('should not call callback on background or inactive states', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppActive(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('inactive');
      });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('useAppBackground', () => {
    // Success test: calls callback on transition to background
    it('should call callback when app goes to background', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppBackground(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    // Failure test: does not call on initial background state
    it('should not call callback if already background on mount', () => {
      const callback = jest.fn();
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      renderHook(() => useAppBackground(callback));
      
      expect(callback).not.toHaveBeenCalled();
    });

    // Success test: only calls on transitions TO background
    it('should only fire on transition TO background', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppBackground(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Setting to background again shouldn't call it
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    // Failure test: does not call on other state changes
    it('should not call callback on active or inactive states', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppBackground(callback));
      
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      act(() => {
        useLifecycleStore.getState().setAppState('inactive');
      });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Semantic Tests - Hook Behavioral Invariants', () => {
    // Invariant: useAppActive and useAppBackground are mutually exclusive
    it('should never fire both active and background callbacks simultaneously', () => {
      const activeCallback = jest.fn();
      const backgroundCallback = jest.fn();
      
      renderHook(() => {
        useAppActive(activeCallback);
        useAppBackground(backgroundCallback);
      });
      
      // Transition to background
      act(() => {
        useLifecycleStore.getState().setAppState('background');
      });
      
      // Only background should fire
      expect(backgroundCallback).toHaveBeenCalledTimes(1);
      expect(activeCallback).not.toHaveBeenCalled();
      
      // Transition to active
      act(() => {
        useLifecycleStore.getState().setAppState('active');
      });
      
      // Now only active should fire (1 time total)
      expect(activeCallback).toHaveBeenCalledTimes(1);
      expect(backgroundCallback).toHaveBeenCalledTimes(1); // Still 1 from before
    });

    // Behavioral: Hooks respond to ALL valid state transitions
    it('should fire callbacks for all valid transitions regardless of path', () => {
      const activeCallback = jest.fn();
      renderHook(() => useAppActive(activeCallback));
      
      // Transition paths: background->active, inactive->active, unknown->active
      const transitionPaths: [AppState, AppState][] = [
        ['background', 'active'],
        ['inactive', 'active'],
        ['unknown', 'active'],
      ];
      
      transitionPaths.forEach(([from, to]) => {
        act(() => {
          useLifecycleStore.getState().setAppState(from);
        });
        act(() => {
          useLifecycleStore.getState().setAppState(to);
        });
      });
      
      // Should fire once for each transition TO active
      expect(activeCallback).toHaveBeenCalledTimes(3);
    });

    // Invariant: Hooks remain consistent with store state
    it('should always return state that matches the store', () => {
      const { result } = renderHook(() => useAppState());
      
      const states: AppState[] = ['active', 'background', 'inactive'];
      
      states.forEach((state) => {
        act(() => {
          useLifecycleStore.getState().setAppState(state);
        });
        
        expect(result.current).toBe(useLifecycleStore.getState().currentState);
      });
    });

    // Behavioral: Callbacks fire exactly once per transition
    it('should fire callback exactly once per unique transition', () => {
      const callback = jest.fn();
      
      renderHook(() => useAppActive(callback));
      
      // Same transition multiple times
      for (let i = 0; i < 3; i++) {
        act(() => {
          useLifecycleStore.getState().setAppState('background');
        });
        act(() => {
          useLifecycleStore.getState().setAppState('active');
        });
      }
      
      // Should fire exactly 3 times (once per transition)
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });
});
