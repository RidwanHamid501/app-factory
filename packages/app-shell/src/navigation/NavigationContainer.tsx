import React, { useRef, useCallback } from 'react';
import { NavigationContainer as RNNavigationContainer, Theme } from '@react-navigation/native';
import { getStateFromPath } from '@react-navigation/native';
import { Logger } from '../utils/logger';
import { navigationRef } from './navigationRef';
import type { AppNavigatorConfig } from './types';
import type { ParamListBase } from '@react-navigation/native';

interface NavigationContainerProps<T extends ParamListBase = ParamListBase> {
  children: React.ReactNode;
  config?: AppNavigatorConfig<T>;
  onReady?: () => void;
  theme?: Theme;
}

export function NavigationContainer<T extends ParamListBase = ParamListBase>({
  children,
  config,
  onReady,
  theme,
}: NavigationContainerProps<T>) {
  const routeNameRef = useRef<string | undefined>(undefined);
  const onDeepLink = config?.onDeepLink;

  const handleReady = useCallback(() => {
    const currentRouteName = navigationRef.getCurrentRoute()?.name;
    routeNameRef.current = currentRouteName;
    Logger.info('[Navigation] Ready. Initial route:', currentRouteName);
    
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  const handleStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName) {
      Logger.info(`[Navigation] ${previousRouteName} → ${currentRouteName}`);
      routeNameRef.current = currentRouteName;
    }
  }, []);

  const linking = config?.linking ? {
    prefixes: config.linking.prefixes,
    config: {
      screens: config.linking.screens as any,
    },
    getStateFromPath: (path: string, options: any) => {
      Logger.info('[Deep Link] Received path:', path);
      
      if (onDeepLink && path && config.linking) {
        const prefix = config.linking.prefixes[0] || '';
        const fullUrl = `${prefix}${path}`;
        onDeepLink(fullUrl, path);
      }
      
      const state = getStateFromPath(path, options);
      if (state) {
        Logger.info('[Deep Link] Parsed to navigation state');
      }
      return state;
    },
  } : undefined;

  return (
    <RNNavigationContainer
      ref={navigationRef}
      theme={theme}
      linking={linking as any}
      fallback={config?.fallback ? <config.fallback /> : undefined}
      onReady={handleReady}
      onStateChange={handleStateChange}
      documentTitle={{ enabled: true }}
    >
      {children}
    </RNNavigationContainer>
  );
}
