// useStartupType.test.ts - Tests for startup type hooks
// Official React Testing Library docs: https://testing-library.com/docs/react-native-testing-library/intro

import { renderHook, act } from '@testing-library/react-native';
import { useStartupType, useColdStart, useWarmStart } from '../useStartupType';
import { useLifecycleStore } from '../../LifecycleStore';

describe('useStartupType hooks', () => {
  // Store reset handled automatically by __mocks__/zustand.ts

  describe('useStartupType', () => {
    // Success test: returns current startup type
    it('should return current startup type', () => {
      const { result } = renderHook(() => useStartupType());
      
      expect(result.current).toBe('cold');
    });

    // Success test: updates when startup type changes
    it('should update when startup type changes', () => {
      const { result } = renderHook(() => useStartupType());
      
      expect(result.current).toBe('cold');
      
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      expect(result.current).toBe('warm');
    });

    // Success test: can switch back to cold
    it('should track transition back to cold', () => {
      const { result } = renderHook(() => useStartupType());
      
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      expect(result.current).toBe('warm');
      
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      expect(result.current).toBe('cold');
    });
  });

  describe('useColdStart', () => {
    // Success test: returns true for cold starts
    it('should return true when startup type is cold', () => {
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      const { result } = renderHook(() => useColdStart());
      
      expect(result.current).toBe(true);
    });

    // Failure test: returns false for warm starts
    it('should return false when startup type is warm', () => {
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      const { result } = renderHook(() => useColdStart());
      
      expect(result.current).toBe(false);
    });

    // Success test: updates reactively
    it('should update when startup type changes', () => {
      const { result } = renderHook(() => useColdStart());
      
      expect(result.current).toBe(true);
      
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      expect(result.current).toBe(false);
    });
  });

  describe('useWarmStart', () => {
    // Success test: returns true for warm starts
    it('should return true when startup type is warm', () => {
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      const { result } = renderHook(() => useWarmStart());
      
      expect(result.current).toBe(true);
    });

    // Failure test: returns false for cold starts
    it('should return false when startup type is cold', () => {
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      const { result } = renderHook(() => useWarmStart());
      
      expect(result.current).toBe(false);
    });

    // Success test: updates reactively
    it('should update when startup type changes', () => {
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      const { result } = renderHook(() => useWarmStart());
      
      expect(result.current).toBe(true);
      
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      expect(result.current).toBe(false);
    });
  });

  describe('combined usage', () => {
    // Success test: cold and warm start hooks are mutually exclusive
    it('should have useColdStart and useWarmStart be mutually exclusive', () => {
      const { result: coldResult } = renderHook(() => useColdStart());
      const { result: warmResult } = renderHook(() => useWarmStart());
      
      // Initially cold
      expect(coldResult.current).toBe(true);
      expect(warmResult.current).toBe(false);
      
      // Switch to warm
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      expect(coldResult.current).toBe(false);
      expect(warmResult.current).toBe(true);
    });
  });

  describe('Semantic Tests - Startup Type Invariants', () => {
    // Invariant: useColdStart and useWarmStart are mutually exclusive
    it('should never return true for both cold and warm start simultaneously', () => {
      const { result: coldResult } = renderHook(() => useColdStart());
      const { result: warmResult } = renderHook(() => useWarmStart());
      
      // Test for cold start state
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      expect(coldResult.current).toBe(true);
      expect(warmResult.current).toBe(false);
      
      // Test for warm start state
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      expect(coldResult.current).toBe(false);
      expect(warmResult.current).toBe(true);
      
      // XOR condition: exactly one must be true
      expect(coldResult.current).not.toBe(warmResult.current);
    });

    // Behavioral: Startup type has semantic meaning
    it('should reflect cold start as initial app launch semantics', () => {
      const { result } = renderHook(() => useStartupType());
      
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      // Cold start means fresh launch
      expect(result.current).toBe('cold');
      expect(renderHook(() => useColdStart()).result.current).toBe(true);
    });

    it('should reflect warm start as resume after long absence semantics', () => {
      const { result } = renderHook(() => useStartupType());
      
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      // Warm start means returning after long time
      expect(result.current).toBe('warm');
      expect(renderHook(() => useWarmStart()).result.current).toBe(true);
    });

    // Invariant: Hooks remain consistent with store
    it('should always match the store startup type value', () => {
      const { result: hookResult } = renderHook(() => useStartupType());
      
      act(() => {
        useLifecycleStore.getState().setStartupType('warm');
      });
      
      expect(hookResult.current).toBe(useLifecycleStore.getState().startupType);
      
      act(() => {
        useLifecycleStore.getState().setStartupType('cold');
      });
      
      expect(hookResult.current).toBe(useLifecycleStore.getState().startupType);
    });

    // Behavioral: Boolean helpers provide clear intent
    it('should provide clear true/false indicators for startup type checking', () => {
      const coldHook = renderHook(() => useColdStart());
      const warmHook = renderHook(() => useWarmStart());
      
      // Both helpers should return boolean values only
      expect(typeof coldHook.result.current).toBe('boolean');
      expect(typeof warmHook.result.current).toBe('boolean');
      
      // They should never both be true or both be false
      expect(coldHook.result.current).not.toBe(warmHook.result.current);
    });
  });
});
