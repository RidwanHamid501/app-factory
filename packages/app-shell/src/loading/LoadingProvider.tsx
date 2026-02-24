import React, { useEffect, useRef } from 'react';
import { useLoadingStore } from './loadingStore';
import { hideSplash } from './SplashController';
import { Logger } from '../utils/logger';
import type { LoadingConfig, LoadingTask } from './types';

// Loading orchestration provider - Official docs: https://react.dev/reference/react/useEffect
export function LoadingProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: LoadingConfig;
}) {
  const {
    splashMinDuration = 1000,
    initializationTimeout = 10000,
    tasks = [],
    onReady,
    onTimeout,
  } = config || {};

  const {
    startInitialization,
    completeTask,
    failTask,
    setCurrentTask,
    markAppReady,
    isAppReady,
  } = useLoadingStore();

  const initStartTime = useRef(Date.now());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    startInitialization();

    const timeoutId = setTimeout(() => {
      if (!isAppReady) {
        Logger.warn('[LoadingProvider] Initialization timeout reached');
        onTimeout?.();
        finishInitialization();
      }
    }, initializationTimeout);

    runInitializationTasks(tasks).finally(() => {
      clearTimeout(timeoutId);
      finishInitialization();
    });

    async function finishInitialization() {
      const elapsed = Date.now() - initStartTime.current;
      const remaining = Math.max(0, splashMinDuration - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      markAppReady();
      Logger.info('[LoadingProvider] App ready!');
      await hideSplash({ fade: true, duration: 250 });
      onReady?.();
    }
  }, []);

  async function runInitializationTasks(tasks: LoadingTask[]) {
    const criticalTasks = tasks.filter((t) => t.critical);
    const nonCriticalTasks = tasks.filter((t) => !t.critical);

    for (const task of criticalTasks) {
      await executeTask(task);
    }

    nonCriticalTasks.forEach((task) => {
      executeTask(task).catch(() => {});
    });
  }

  async function executeTask(task: LoadingTask) {
    setCurrentTask(task.id);
    Logger.debug('[LoadingProvider] Executing task:', task.name);

    try {
      const timeoutPromise = task.timeout
        ? new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Task timeout')), task.timeout)
          )
        : null;

      const taskPromise = task.executor();

      if (timeoutPromise) {
        await Promise.race([taskPromise, timeoutPromise]);
      } else {
        await taskPromise;
      }

      completeTask(task.id);
    } catch (error) {
      Logger.error('[LoadingProvider] Task failed:', task.name, error);
      failTask(task.id);

      if (task.critical) {
        throw error;
      }
    }
  }

  return <>{children}</>;
}
