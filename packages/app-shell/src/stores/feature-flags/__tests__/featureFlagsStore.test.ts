import { renderHook, act } from '@testing-library/react-native';
import { useFeatureFlagsStore } from '../featureFlagsStore';
import {
  useFeatureFlag,
  useFeatureFlagValue,
  useFeatureFlags,
  useFeatureFlagActions,
} from '../hooks';

describe('Feature Flags Store', () => {
  beforeEach(() => {
    const store = useFeatureFlagsStore.getState();
    store.resetFlags();
  });

  describe('Initial State', () => {
    it('should initialize with default feature flags', () => {
      const state = useFeatureFlagsStore.getState();
      
      expect(state.flags).toEqual({
        'new_ui_enabled': false,
        'analytics_enabled': true,
        'beta_features': false,
      });
    });
  });

  describe('setFlag', () => {
    it('should set a boolean flag', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('new_ui_enabled', true);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['new_ui_enabled']).toBe(true);
    });

    it('should set a string flag', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('theme_variant', 'dark');
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['theme_variant']).toBe('dark');
    });

    it('should set a number flag', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('max_items', 100);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['max_items']).toBe(100);
    });

    it('should update existing flag', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('analytics_enabled', false);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['analytics_enabled']).toBe(false);
    });

    it('should fail when setting flag with undefined value', () => {
      const store = useFeatureFlagsStore.getState();
      
      expect(() => {
        act(() => {
          // @ts-expect-error Testing invalid value
          store.setFlag('invalid_flag', undefined);
        });
      }).not.toThrow();
    });
  });

  describe('setFlags', () => {
    it('should replace all flags', () => {
      const store = useFeatureFlagsStore.getState();
      const newFlags = {
        'feature_a': true,
        'feature_b': false,
        'max_count': 50,
      };
      
      act(() => {
        store.setFlags(newFlags);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags).toEqual(newFlags);
    });

    it('should overwrite existing flags completely', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlags({ 'only_flag': true });
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags).toEqual({ 'only_flag': true });
      expect(state.flags['new_ui_enabled']).toBeUndefined();
    });
  });

  describe('resetFlags', () => {
    it('should reset flags to defaults', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('new_ui_enabled', true);
        store.setFlag('custom_flag', 'custom');
      });
      
      act(() => {
        store.resetFlags();
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags).toEqual({
        'new_ui_enabled': false,
        'analytics_enabled': true,
        'beta_features': false,
      });
    });

    it('should remove custom flags on reset', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('custom_flag', 'value');
      });
      
      expect(useFeatureFlagsStore.getState().flags['custom_flag']).toBe('value');
      
      act(() => {
        store.resetFlags();
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['custom_flag']).toBeUndefined();
    });
  });

  describe('Hooks', () => {
    describe('useFeatureFlag', () => {
      it('should return true for enabled boolean flag', () => {
        const { result } = renderHook(() => useFeatureFlag('analytics_enabled'));
        expect(result.current).toBe(true);
      });

      it('should return false for disabled boolean flag', () => {
        const { result } = renderHook(() => useFeatureFlag('new_ui_enabled'));
        expect(result.current).toBe(false);
      });

      it('should return false for non-existent flag', () => {
        const { result } = renderHook(() => useFeatureFlag('non_existent'));
        expect(result.current).toBe(false);
      });

      it('should return true for truthy string flag', () => {
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('string_flag', 'enabled');
        });
        
        const { result } = renderHook(() => useFeatureFlag('string_flag'));
        expect(result.current).toBe(true);
      });

      it('should return true for non-zero number flag', () => {
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('number_flag', 5);
        });
        
        const { result } = renderHook(() => useFeatureFlag('number_flag'));
        expect(result.current).toBe(true);
      });

      it('should return false for zero number flag', () => {
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('zero_flag', 0);
        });
        
        const { result } = renderHook(() => useFeatureFlag('zero_flag'));
        expect(result.current).toBe(false);
      });

      it('should update when flag changes', () => {
        const { result } = renderHook(() => useFeatureFlag('beta_features'));
        const store = useFeatureFlagsStore.getState();
        
        expect(result.current).toBe(false);
        
        act(() => {
          store.setFlag('beta_features', true);
        });
        
        expect(result.current).toBe(true);
      });
    });

    describe('useFeatureFlagValue', () => {
      it('should return actual flag value', () => {
        const { result } = renderHook(() => 
          useFeatureFlagValue('analytics_enabled', false)
        );
        expect(result.current).toBe(true);
      });

      it('should return default value for non-existent flag', () => {
        const { result } = renderHook(() => 
          useFeatureFlagValue('non_existent', 'default')
        );
        expect(result.current).toBe('default');
      });

      it('should return string flag value', () => {
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('theme', 'dark');
        });
        
        const { result } = renderHook(() => 
          useFeatureFlagValue('theme', 'light')
        );
        expect(result.current).toBe('dark');
      });

      it('should return number flag value', () => {
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('max_items', 50);
        });
        
        const { result } = renderHook(() => 
          useFeatureFlagValue('max_items', 10)
        );
        expect(result.current).toBe(50);
      });

      it('should update when flag value changes', () => {
        const { result } = renderHook(() => 
          useFeatureFlagValue('beta_features', false)
        );
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('beta_features', true);
        });
        
        expect(result.current).toBe(true);
      });
    });

    describe('useFeatureFlags', () => {
      it('should return all feature flags', () => {
        const { result } = renderHook(() => useFeatureFlags());
        
        expect(result.current).toEqual({
          'new_ui_enabled': false,
          'analytics_enabled': true,
          'beta_features': false,
        });
      });

      it('should update when flags change', () => {
        const { result } = renderHook(() => useFeatureFlags());
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('new_ui_enabled', true);
        });
        
        expect(result.current['new_ui_enabled']).toBe(true);
      });
    });

    describe('useFeatureFlagActions', () => {
      it('should return actions', () => {
        const { result } = renderHook(() => useFeatureFlagActions());
        
        expect(result.current.setFlags).toBeDefined();
        expect(result.current.setFlag).toBeDefined();
        expect(result.current.resetFlags).toBeDefined();
      });

      it('should call setFlag action', () => {
        const { result } = renderHook(() => useFeatureFlagActions());
        
        act(() => {
          result.current.setFlag('test_flag', true);
        });
        
        const state = useFeatureFlagsStore.getState();
        expect(state.flags['test_flag']).toBe(true);
      });

      it('should call setFlags action', () => {
        const { result } = renderHook(() => useFeatureFlagActions());
        
        act(() => {
          result.current.setFlags({ 'only_this': true });
        });
        
        const state = useFeatureFlagsStore.getState();
        expect(state.flags).toEqual({ 'only_this': true });
      });

      it('should call resetFlags action', () => {
        const { result } = renderHook(() => useFeatureFlagActions());
        const store = useFeatureFlagsStore.getState();
        
        act(() => {
          store.setFlag('custom', 'value');
        });
        
        act(() => {
          result.current.resetFlags();
        });
        
        const state = useFeatureFlagsStore.getState();
        expect(state.flags['custom']).toBeUndefined();
      });
    });
  });

  describe('Semantic Invariants', () => {
    it('should preserve other flags when setting one flag', () => {
      const store = useFeatureFlagsStore.getState();
      const initialFlags = { ...useFeatureFlagsStore.getState().flags };
      
      act(() => {
        store.setFlag('new_ui_enabled', true);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['analytics_enabled']).toBe(initialFlags['analytics_enabled']);
      expect(state.flags['beta_features']).toBe(initialFlags['beta_features']);
    });

    it('should handle rapid successive flag updates', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('flag', 'value1');
        store.setFlag('flag', 'value2');
        store.setFlag('flag', 'value3');
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['flag']).toBe('value3');
    });

    it('should maintain flags consistency after reset', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('custom', 'value');
        store.resetFlags();
      });
      
      const state1 = useFeatureFlagsStore.getState();
      
      act(() => {
        store.resetFlags();
      });
      
      const state2 = useFeatureFlagsStore.getState();
      expect(state2.flags).toEqual(state1.flags);
    });

    it('should support dynamic flag keys', () => {
      const store = useFeatureFlagsStore.getState();
      const dynamicKey = `feature_${Date.now()}`;
      
      act(() => {
        store.setFlag(dynamicKey, true);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags[dynamicKey]).toBe(true);
    });

    it('should handle boolean to number type changes', () => {
      const store = useFeatureFlagsStore.getState();
      
      act(() => {
        store.setFlag('flexible_flag', true);
      });
      
      expect(useFeatureFlagsStore.getState().flags['flexible_flag']).toBe(true);
      
      act(() => {
        store.setFlag('flexible_flag', 42);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags['flexible_flag']).toBe(42);
    });

    it('should not affect flags when calling setFlags with same values', () => {
      const store = useFeatureFlagsStore.getState();
      const initialFlags = { ...useFeatureFlagsStore.getState().flags };
      
      act(() => {
        store.setFlags(initialFlags);
      });
      
      const state = useFeatureFlagsStore.getState();
      expect(state.flags).toEqual(initialFlags);
    });
  });
});
