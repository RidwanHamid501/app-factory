import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from './themeStore';
import { Logger } from '../../utils/logger';
import type { ThemeConfig } from '../types';

export function useInitializeTheme(config?: ThemeConfig) {
  const colorScheme = useColorScheme();
  const setSystemColorScheme = useThemeStore((state) => state.setSystemColorScheme);
  
  useEffect(() => {
    const followSystem = config?.followSystem ?? true;
    
    if (followSystem) {
      Logger.info(`System color scheme: ${colorScheme}`);
      setSystemColorScheme(colorScheme);
    }
  }, [colorScheme, setSystemColorScheme, config?.followSystem]);
}

export function useTheme() {
  return useThemeStore((state) => state.theme);
}

export function useThemeMode() {
  return useThemeStore((state) => state.mode);
}

export function useThemeActions() {
  return {
    setMode: useThemeStore((state) => state.setMode),
    toggleMode: useThemeStore((state) => state.toggleMode),
  };
}

export function useThemeColors() {
  return useThemeStore((state) => state.theme.colors);
}

export function useTypography() {
  return useThemeStore((state) => state.theme.typography);
}

export function useSpacing() {
  return useThemeStore((state) => state.theme.spacing);
}

export function useIsDarkMode() {
  return useThemeStore((state) => state.theme.mode === 'dark');
}

