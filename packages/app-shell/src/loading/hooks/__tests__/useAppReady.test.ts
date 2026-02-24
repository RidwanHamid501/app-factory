import { renderHook, act } from '@testing-library/react-native';
import { useAppReady } from '../useAppReady';
import { useLoadingStore } from '../../loadingStore';

describe('useAppReady', () => {
  beforeEach(() => {
    useLoadingStore.getState().reset();
  });

  describe('Success Cases', () => {
    it('returns correct initialization state', () => {
      const { result } = renderHook(() => useAppReady());

      expect(result.current.isInitializing).toBe(true);
      expect(result.current.isAppReady).toBe(false);
    });

    it('returns correct ready state', () => {
      act(() => {
        useLoadingStore.getState().markAppReady();
      });

      const { result } = renderHook(() => useAppReady());

      expect(result.current.isInitializing).toBe(false);
      expect(result.current.isAppReady).toBe(true);
    });

    it('updates when state changes', () => {
      const { result } = renderHook(() => useAppReady());

      expect(result.current.isAppReady).toBe(false);

      act(() => {
        useLoadingStore.getState().markAppReady();
      });

      expect(result.current.isAppReady).toBe(true);
    });
  });

  describe('Failure Cases', () => {
    it('handles reset correctly', () => {
      act(() => {
        useLoadingStore.getState().markAppReady();
      });

      const { result } = renderHook(() => useAppReady());
      expect(result.current.isAppReady).toBe(true);

      act(() => {
        useLoadingStore.getState().reset();
      });

      expect(result.current.isAppReady).toBe(false);
      expect(result.current.isInitializing).toBe(true);
    });
  });

  describe('Semantic Tests', () => {
    it('reflects initialization lifecycle correctly', () => {
      const { result } = renderHook(() => useAppReady());

      expect(result.current.isInitializing).toBe(true);
      expect(result.current.isAppReady).toBe(false);

      act(() => {
        useLoadingStore.getState().startInitialization();
      });

      expect(result.current.isInitializing).toBe(true);

      act(() => {
        useLoadingStore.getState().markAppReady();
      });

      expect(result.current.isInitializing).toBe(false);
      expect(result.current.isAppReady).toBe(true);
    });

    it('maintains reference stability through re-renders', () => {
      const { result, rerender: rerenderHook } = renderHook(() => useAppReady());
      const firstResult = result.current;

      rerenderHook({});

      expect(result.current).toEqual(firstResult);
    });
  });
});
