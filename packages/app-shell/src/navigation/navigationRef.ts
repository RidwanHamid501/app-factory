// Global navigation ref for imperative navigation
// Official pattern: https://reactnavigation.org/docs/navigating-without-navigation-prop

import { createNavigationContainerRef } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';
import { Logger } from '../utils/logger';

// Global navigation ref - use for navigation outside React components (push notifications, deep links, error recovery)
export const navigationRef = createNavigationContainerRef<ParamListBase>();

// Navigate to a screen imperatively (outside React components)
export function navigate<T extends ParamListBase>(name: keyof T, params?: T[keyof T]): void {
  if (navigationRef.isReady()) {
    Logger.info(`Navigating to ${String(name)}`, params);
    // @ts-expect-error - Generic type inference limitation
    navigationRef.navigate(name, params);
  } else {
    Logger.warn(`Navigation not ready, cannot navigate to ${String(name)}`);
  }
}

// Go back imperatively
export function goBack(): void {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    Logger.info('Navigating back');
    navigationRef.goBack();
  } else {
    Logger.warn('Cannot go back - either not ready or no history');
  }
}

// Reset navigation stack imperatively - useful for logout flows or error recovery
export function resetRoot<T extends ParamListBase>(name: keyof T, params?: T[keyof T]): void {
  if (navigationRef.isReady()) {
    Logger.info(`Resetting navigation to ${String(name)}`);
    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: String(name), params }],
    });
  } else {
    Logger.warn('Navigation not ready, cannot reset');
  }
}

// Get current route name - useful for analytics tracking
export function getCurrentRouteName(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}

// Get current route params
export function getCurrentRouteParams<T extends ParamListBase>(): T[keyof T] | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.params as T[keyof T] | undefined;
  }
  return undefined;
}
