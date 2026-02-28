import type { ComponentType, ReactNode } from 'react';
import type { ParamListBase } from '@react-navigation/native';
import type { Theme } from '../stores/theme/types';

export interface AppAdapter<TRoutes extends ParamListBase = ParamListBase> {
  name: string;
  version: string;
  screens?: ScreenDefinition<TRoutes>[];
  providers?: ProviderDefinition[];
  middleware?: MiddlewareDefinition;
  initialization?: InitializationHooks;
  config?: AdapterConfig;
}

export interface ScreenDefinition<TRoutes extends ParamListBase = ParamListBase> {
  name: keyof TRoutes;
  component: ComponentType<unknown>;
  options?: {
    title?: string;
    headerShown?: boolean;
    [key: string]: unknown;
  };
}

export interface ProviderDefinition {
  name: string;
  provider: ComponentType<{ children: ReactNode }>;
  order?: number; // Lower numbers wrap outer (closer to root)
}

export interface MiddlewareDefinition {
  onLifecycleEvent?: (event: string, context: LifecycleContext) => void | Promise<void>;
  onNavigate?: (route: string, params?: Record<string, unknown>) => boolean;
  onDeepLink?: (url: string) => boolean;
  onError?: (error: Error, errorInfo: unknown) => void;
  onTelemetryEvent?: (eventName: string, properties?: Record<string, unknown>) => Record<string, unknown> | void;
}

export interface InitializationHooks {
  beforeMount?: () => void | Promise<void>;
  afterMount?: () => void | Promise<void>;
  onReady?: () => void | Promise<void>;
  onBackground?: () => void | Promise<void>;
  onForeground?: () => void | Promise<void>;
}

export interface AdapterConfig {
  theme?: {
    light?: Partial<Theme>;
    dark?: Partial<Theme>;
  };
  settings?: Record<string, unknown>;
  strings?: Record<string, string>;
  featureFlags?: Record<string, boolean | string | number>;
  linkingPrefixes?: string[];
}

export interface LifecycleContext {
  timestamp: number;
  appState: string;
  isFirstLaunch: boolean;
}

export interface AdapterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AdapterRegistryState {
  adapter: AppAdapter | null;
  isRegistered: boolean;
  validationResult: AdapterValidationResult | null;
}
