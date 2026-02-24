import { renderHook, act } from '@testing-library/react-native';
import { useLoadingState } from '../useLoadingState';
import { useLoadingStore } from '../../loadingStore';

describe('useLoadingState', () => {
  beforeEach(() => {
    useLoadingStore.getState().reset();
  });

  describe('Success Cases', () => {
    it('returns all loading state properties', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current).toHaveProperty('isInitializing');
      expect(result.current).toHaveProperty('isAppReady');
      expect(result.current).toHaveProperty('completedTasks');
      expect(result.current).toHaveProperty('failedTasks');
      expect(result.current).toHaveProperty('currentTask');
      expect(result.current).toHaveProperty('completedCount');
      expect(result.current).toHaveProperty('failedCount');
    });

    it('tracks completed tasks count', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.completedCount).toBe(0);

      act(() => {
        useLoadingStore.getState().completeTask('task1');
        useLoadingStore.getState().completeTask('task2');
      });

      expect(result.current.completedCount).toBe(2);
      expect(result.current.completedTasks).toEqual(['task1', 'task2']);
    });

    it('tracks failed tasks count', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.failedCount).toBe(0);

      act(() => {
        useLoadingStore.getState().failTask('task1');
        useLoadingStore.getState().failTask('task2');
      });

      expect(result.current.failedCount).toBe(2);
      expect(result.current.failedTasks).toEqual(['task1', 'task2']);
    });

    it('updates current task correctly', () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.currentTask).toBeNull();

      act(() => {
        useLoadingStore.getState().setCurrentTask('task1');
      });

      expect(result.current.currentTask).toBe('task1');
    });
  });

  describe('Failure Cases', () => {
    it('handles reset correctly', () => {
      act(() => {
        useLoadingStore.getState().completeTask('task1');
        useLoadingStore.getState().failTask('task2');
        useLoadingStore.getState().setCurrentTask('task3');
      });

      const { result } = renderHook(() => useLoadingState());
      expect(result.current.completedCount).toBe(1);
      expect(result.current.failedCount).toBe(1);

      act(() => {
        useLoadingStore.getState().reset();
      });

      expect(result.current.completedCount).toBe(0);
      expect(result.current.failedCount).toBe(0);
      expect(result.current.currentTask).toBeNull();
    });
  });

  describe('Semantic Tests', () => {
    it('provides complete task lifecycle tracking', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        useLoadingStore.getState().startInitialization();
        useLoadingStore.getState().setCurrentTask('task1');
      });

      expect(result.current.isInitializing).toBe(true);
      expect(result.current.currentTask).toBe('task1');

      act(() => {
        useLoadingStore.getState().completeTask('task1');
      });

      expect(result.current.completedTasks).toContain('task1');
      expect(result.current.completedCount).toBe(1);

      act(() => {
        useLoadingStore.getState().markAppReady();
      });

      expect(result.current.isAppReady).toBe(true);
      expect(result.current.isInitializing).toBe(false);
    });

    it('accurately reflects mixed success and failure states', () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        useLoadingStore.getState().completeTask('success1');
        useLoadingStore.getState().failTask('fail1');
        useLoadingStore.getState().completeTask('success2');
      });

      expect(result.current.completedCount).toBe(2);
      expect(result.current.failedCount).toBe(1);
      expect(result.current.completedTasks).toEqual(['success1', 'success2']);
      expect(result.current.failedTasks).toEqual(['fail1']);
    });
  });
});
