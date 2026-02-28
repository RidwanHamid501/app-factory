import React, { useEffect, useRef } from 'react';
import { useRemoteConfigStore } from './remoteConfigStore';
import { initialize, fetchAndActivate, enableRealtime, disableRealtime } from './RemoteConfigManager';
import { Logger } from '../utils/logger';
import type { RemoteConfigConfig } from './types';

// Remote config provider - Official docs: https://rnfirebase.io/remote-config/usage
export function RemoteConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: RemoteConfigConfig;
}) {
  const {
    setInitialized,
    setFetching,
    setConfig,
    setError,
  } = useRemoteConfigStore();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function initializeConfig() {
      try {
        Logger.info('[RemoteConfigProvider] Initializing remote config');

        // Initialize with cached values (instant)
        const cachedSnapshot = await initialize(config || {});
        setConfig(cachedSnapshot);
        setInitialized(true);

        // Fetch new values in background
        setFetching(true);
        const remoteSnapshot = await fetchAndActivate(config || {});
        setConfig(remoteSnapshot);
        setFetching(false);

        // Enable real-time updates if configured
        if (config?.enableRealtime) {
          enableRealtime(config, (snapshot) => {
            setConfig(snapshot);
          });
        }
      } catch (error) {
        Logger.error('[RemoteConfigProvider] Initialization error:', error);
        setError(error as Error);
        setFetching(false);
        setInitialized(true); // Still mark as initialized to unblock app
      }
    }

    initializeConfig();

    return () => {
      if (config?.enableRealtime) {
        disableRealtime();
      }
    };
  }, []);

  return <>{children}</>;
}
