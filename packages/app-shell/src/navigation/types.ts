// Navigation types - Official docs: https://reactnavigation.org/docs/typescript
import type { NavigationContainerRef, ParamListBase, NavigationProp } from '@react-navigation/native';

// Base navigation configuration that apps extend
// Official docs: https://reactnavigation.org/docs/configuring-links
export interface NavigationConfig<T extends ParamListBase = ParamListBase> {
  prefixes: string[]; // Deep link prefixes for the app
  screens: Partial<Record<keyof T, string>>; // Screen-to-path mapping for deep links
}

export interface AppNavigatorConfig<T extends ParamListBase = ParamListBase> {
  linking?: NavigationConfig<T>;
  fallback?: React.ComponentType;
  onDeepLink?: (url: string, path: string) => void;
}

// Deep link payload
export interface DeepLink {
  url: string;
  scheme: string;
  hostname: string | null;
  path: string;
  queryParams: Record<string, string>;
}

// Navigation state for tracking readiness
// Note: Full navigation state tracking (for analytics) will be part of Phase 6 telemetry integration
export interface NavigationState {
  isReady: boolean;
}

// Type-safe navigation prop helper - Official docs: https://reactnavigation.org/docs/typescript#organizing-types
export type TypedNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = keyof ParamList
> = NavigationProp<ParamList, RouteName>;

// Navigation ref type for imperative navigation
// Official docs: https://reactnavigation.org/docs/navigating-without-navigation-prop
export type AppNavigationRef<T extends ParamListBase = ParamListBase> = NavigationContainerRef<T>;

