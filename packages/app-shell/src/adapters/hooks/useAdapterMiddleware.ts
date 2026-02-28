import { useCallback } from 'react';
import { useAdapterRegistry } from '../AdapterRegistry';
import { Logger } from '../../utils/logger';
import type { LifecycleContext } from '../types';

export function useAdapterMiddleware() {
  const middleware = useAdapterRegistry((state) => state.getMiddleware()) ?? {};

  const invokeLifecycleHook = useCallback(
    async (event: string, context: LifecycleContext) => {
      if (middleware?.onLifecycleEvent) {
        try {
          await middleware.onLifecycleEvent(event, context);
        } catch (error) {
          Logger.error('[AdapterMiddleware] Lifecycle hook error:', error);
        }
      }
    },
    [middleware]
  );

  const invokeNavigateHook = useCallback(
    (route: string, params?: Record<string, unknown>): boolean => {
      if (middleware?.onNavigate) {
        try {
          return middleware.onNavigate(route, params) ?? true;
        } catch (error) {
          Logger.error('[AdapterMiddleware] Navigate hook error:', error);
          return true;
        }
      }
      return true;
    },
    [middleware]
  );

  const invokeDeepLinkHook = useCallback(
    (url: string): boolean => {
      if (middleware?.onDeepLink) {
        try {
          return middleware.onDeepLink(url) ?? true;
        } catch (error) {
          Logger.error('[AdapterMiddleware] Deep link hook error:', error);
          return true;
        }
      }
      return true;
    },
    [middleware]
  );

  const invokeErrorHook = useCallback(
    (error: Error, errorInfo: unknown) => {
      if (middleware?.onError) {
        try {
          middleware.onError(error, errorInfo);
        } catch (err) {
          Logger.error('[AdapterMiddleware] Error hook error:', err);
        }
      }
    },
    [middleware]
  );

  const invokeTelemetryHook = useCallback(
    (eventName: string, properties?: Record<string, unknown>): Record<string, unknown> | undefined => {
      if (middleware?.onTelemetryEvent) {
        try {
          return middleware.onTelemetryEvent(eventName, properties) || undefined;
        } catch (error) {
          Logger.error('[AdapterMiddleware] Telemetry hook error:', error);
          return undefined;
        }
      }
      return undefined;
    },
    [middleware]
  );

  return {
    invokeLifecycleHook,
    invokeNavigateHook,
    invokeDeepLinkHook,
    invokeErrorHook,
    invokeTelemetryHook,
  };
}
