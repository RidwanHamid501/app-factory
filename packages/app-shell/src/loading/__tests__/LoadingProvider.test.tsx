import React from 'react';
import { View } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { LoadingProvider } from '../LoadingProvider';
import { useLoadingStore } from '../loadingStore';
import * as SplashController from '../SplashController';
import type { LoadingTask } from '../types';

jest.mock('../SplashController', () => ({
  hideSplash: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const TestChild = () => <View testID="test-child" />;

describe('LoadingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLoadingStore.getState().reset();
  });

  describe('Success Cases - Normal initialization', () => {
    it('successfully executes critical tasks in sequence', async () => {
      const executionOrder: string[] = [];
      const tasks: LoadingTask[] = [
        {
          id: 'task1',
          name: 'Task 1',
          critical: true,
          executor: async () => {
            executionOrder.push('task1');
            await new Promise<void>(resolve => setTimeout(() => resolve(), 10));
          },
        },
        {
          id: 'task2',
          name: 'Task 2',
          critical: true,
          executor: async () => {
            executionOrder.push('task2');
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });

      expect(executionOrder).toEqual(['task1', 'task2']);
    });

    it('successfully executes non-critical tasks in parallel', async () => {
      const completed: string[] = [];
      const tasks: LoadingTask[] = [
        {
          id: 'task1',
          name: 'Task 1',
          critical: false,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 20));
            completed.push('task1');
          },
        },
        {
          id: 'task2',
          name: 'Task 2',
          critical: false,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 10));
            completed.push('task2');
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });

      expect(completed.length).toBe(2);
    });

    it('marks completed tasks correctly', async () => {
      const tasks: LoadingTask[] = [
        {
          id: 'task1',
          name: 'Task 1',
          critical: true,
          executor: async () => {},
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        const state = useLoadingStore.getState();
        expect(state.completedTasks).toContain('task1');
      });
    });

    it('respects splash minimum duration', async () => {
      const startTime = Date.now();
      const minDuration = 100;

      render(
        <LoadingProvider config={{ splashMinDuration: minDuration, tasks: [] }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(minDuration);
    });

    it('calls onReady after initialization complete', async () => {
      const onReady = jest.fn();

      render(
        <LoadingProvider config={{ onReady, splashMinDuration: 0, tasks: [] }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(onReady).toHaveBeenCalled();
      });
    });

    it('hides splash after tasks complete', async () => {
      render(
        <LoadingProvider config={{ splashMinDuration: 0, tasks: [] }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(SplashController.hideSplash).toHaveBeenCalledWith({
          fade: true,
          duration: 250,
        });
      });
    });
  });

  describe('Failure Cases', () => {
    it('handles task failures for non-critical tasks', async () => {
      const tasks: LoadingTask[] = [
        {
          id: 'non-critical-fail',
          name: 'Non-Critical Task',
          critical: false,
          executor: async () => {
            throw new Error('Non-critical failure');
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        const state = useLoadingStore.getState();
        expect(state.failedTasks).toContain('non-critical-fail');
        expect(state.isAppReady).toBe(true);
      });
    });

    it('calls onTimeout when timeout reached', async () => {
      const onTimeout = jest.fn();
      const tasks: LoadingTask[] = [
        {
          id: 'slow-task',
          name: 'Slow Task',
          critical: true,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
          },
        },
      ];

      render(
        <LoadingProvider config={{ 
          tasks, 
          initializationTimeout: 50,
          splashMinDuration: 0,
          onTimeout 
        }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(onTimeout).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('handles task timeout correctly', async () => {
      const tasks: LoadingTask[] = [
        {
          id: 'timeout-task',
          name: 'Timeout Task',
          critical: false,
          timeout: 10,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        const state = useLoadingStore.getState();
        expect(state.failedTasks).toContain('timeout-task');
      });
    });
  });

  describe('Semantic Tests', () => {
    it('ensures critical tasks block app ready state', async () => {
      let taskCompleted = false;
      const tasks: LoadingTask[] = [
        {
          id: 'blocking-task',
          name: 'Blocking Task',
          critical: true,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 50));
            taskCompleted = true;
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      expect(useLoadingStore.getState().isAppReady).toBe(false);

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });

      expect(taskCompleted).toBe(true);
    });

    it('ensures non-critical tasks do not block app ready state', async () => {
      const tasks: LoadingTask[] = [
        {
          id: 'background-task',
          name: 'Background Task',
          critical: false,
          executor: async () => {
            await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
          },
        },
      ];

      render(
        <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
          <TestChild />
        </LoadingProvider>
      );

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });
    });

    it('initializes only once even in React StrictMode', async () => {
      const executor = jest.fn().mockResolvedValue(undefined);
      const tasks: LoadingTask[] = [
        {
          id: 'init-task',
          name: 'Init Task',
          critical: true,
          executor,
        },
      ];

      render(
        <React.StrictMode>
          <LoadingProvider config={{ tasks, splashMinDuration: 0 }}>
            <TestChild />
          </LoadingProvider>
        </React.StrictMode>
      );

      await waitFor(() => {
        expect(useLoadingStore.getState().isAppReady).toBe(true);
      });

      expect(executor).toHaveBeenCalledTimes(1);
    });
  });
});
