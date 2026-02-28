import React from 'react';
import { View, Text } from 'react-native';
import type { AppAdapter } from '@factory/app-shell';

const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const factoryTestAdapter: AppAdapter = {
  name: 'factory-test-app',
  version: '1.0.0',

  screens: [
    {
      name: 'TestScreen',
      component: () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Test Screen from Adapter</Text>
        </View>
      ),
      options: {
        title: 'Test Screen',
        headerShown: true,
      },
    },
    {
      name: 'DemoScreen',
      component: () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Demo Screen from Adapter</Text>
        </View>
      ),
      options: {
        title: 'Demo',
      },
    },
  ],

  providers: [
    {
      name: 'TestProvider',
      provider: TestProvider,
      order: 10,
    },
    {
      name: 'CustomThemeProvider',
      provider: CustomThemeProvider,
      order: 50,
    },
  ],

  middleware: {
    onLifecycleEvent: async (event: string, context: unknown) => {
      console.log('[Adapter Middleware] Lifecycle event:', event, context);
    },
    onNavigate: async (from: string, to: string, params: unknown) => {
      console.log('[Adapter Middleware] Navigation:', from, '→', to, params);
    },
    onDeepLink: async (url: string, params: unknown) => {
      console.log('[Adapter Middleware] Deep link:', url, params);
    },
    onError: async (error: Error, context: unknown) => {
      console.log('[Adapter Middleware] Error:', error.message, context);
    },
    onTelemetryEvent: async (eventName: string, properties: unknown) => {
      console.log('[Adapter Middleware] Telemetry:', eventName, properties);
    },
  },

  initialization: {
    beforeMount: async () => {
      console.log('[Adapter Init] Before mount');
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
    onReady: async () => {
      console.log('[Adapter Init] App ready');
    },
    onError: async (error: Error, phase: string) => {
      console.error('[Adapter Init] Error during', phase, ':', error.message);
    },
  },

  config: {
    theme: {
      light: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        error: '#FF3B30',
      },
      dark: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        background: '#000000',
        surface: '#1C1C1E',
        error: '#FF453A',
      },
    },
    settings: {
      appName: 'Factory Test App',
      version: '1.0.0',
      apiUrl: 'https://api.factory-test.app',
      debugMode: true,
    },
    strings: {
      welcome: 'Welcome to Factory Test App',
      error_generic: 'Something went wrong',
      loading: 'Loading...',
      retry: 'Retry',
    },
    featureFlags: {
      experimental_ui: false,
      beta_features: true,
      analytics: true,
    },
    linking: {
      prefixes: ['factorytest://', 'https://factory-test.app'],
    },
  },
};
