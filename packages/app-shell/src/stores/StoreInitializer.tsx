import React, { useEffect } from 'react';
import { useInitializeTheme } from './theme/hooks';
import { useThemeStore } from './theme/themeStore';
import { Logger } from '../utils/logger';
import type { StoreConfig } from './types';

interface StoreInitializerProps {
  children: React.ReactNode;
  config?: StoreConfig;
}

// Config-based store initializer - Official pattern: https://react.dev/reference/react/createContext
export function StoreInitializer({ children, config = {} }: StoreInitializerProps) {
  useInitializeTheme(config.theme);
  
  useEffect(() => {
    if (config.theme?.defaultMode) {
      useThemeStore.getState().setMode(config.theme.defaultMode);
      Logger.info('[Theme] Set default mode:', config.theme.defaultMode);
    }
    
    if (config.theme?.customTheme) {
      useThemeStore.getState().setCustomThemes(config.theme.customTheme);
      Logger.info('[Theme] Applied custom theme');
    }
    
    Logger.info('All stores initialized with config');
  }, []);
  
  return <>{children}</>;
}

