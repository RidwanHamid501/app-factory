import React, { useEffect, useRef } from 'react';
import { lifecycleManager } from './LifecycleManager';
import type { LifecycleConfig } from './types';
import { Logger } from '../utils/logger';

interface LifecycleProviderProps {
  children: React.ReactNode;
  config?: LifecycleConfig;
}

// Config-based lifecycle provider - Official docs: https://reactnative.dev/docs/appstate
export function LifecycleProvider({ children, config = {} }: LifecycleProviderProps) {
  const configRef = useRef(config);
  
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const {
      coldStartThreshold,
      sessionTimeout,
      onAppStarting,
      onAppActive,
      onAppBackground,
      onAppInactive,
      autoInitialize = true,
    } = configRef.current;

    if (!autoInitialize) return;

    lifecycleManager.initialize({ coldStartThreshold, sessionTimeout });
    Logger.info('[LifecycleProvider] Initialized with config');

    const subscriptions = [
      onAppStarting && lifecycleManager.on('appStarting', onAppStarting),
      onAppActive && lifecycleManager.on('appActive', onAppActive),
      onAppBackground && lifecycleManager.on('appBackground', onAppBackground),
      onAppInactive && lifecycleManager.on('appInactive', onAppInactive),
    ].filter(Boolean);

    return () => {
      subscriptions.forEach(sub => sub?.unsubscribe());
      lifecycleManager.destroy();
      Logger.info('[LifecycleProvider] Cleaned up');
    };
  }, []);

  return <>{children}</>;
}
