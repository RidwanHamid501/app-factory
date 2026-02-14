import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';
import { Theme, ThemeMode } from './types';
import { defaultLightTheme, defaultDarkTheme } from './defaultTheme';
import { Logger } from '../../utils/logger';

interface ThemeStore {
  mode: ThemeMode;
  theme: Theme;
  systemColorScheme: ColorSchemeName;
  setMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (scheme: ColorSchemeName) => void;
  toggleMode: () => void;
}

function getEffectiveTheme(mode: ThemeMode, systemScheme: ColorSchemeName): Theme {
  if (mode === 'auto') {
    return systemScheme === 'dark' ? defaultDarkTheme : defaultLightTheme;
  }
  return mode === 'dark' ? defaultDarkTheme : defaultLightTheme;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  mode: 'auto',
  systemColorScheme: null,
  theme: defaultLightTheme,
  
  setMode: (mode: ThemeMode) => {
    const { systemColorScheme } = get();
    Logger.info(`Setting theme mode to: ${mode} (system: ${systemColorScheme})`);
    const effectiveTheme = getEffectiveTheme(mode, systemColorScheme);
    Logger.info(`Applying ${effectiveTheme.colors === defaultDarkTheme.colors ? 'dark' : 'light'} theme`);
    set({ mode, theme: effectiveTheme });
  },
  
  setSystemColorScheme: (scheme: ColorSchemeName) => {
    Logger.info(`System color scheme changed to: ${scheme}`);
    const { mode } = get();
    set({ systemColorScheme: scheme });
    
    if (mode === 'auto') {
      const newTheme = getEffectiveTheme(mode, scheme);
      Logger.info(`Auto mode: applying ${newTheme.colors === defaultDarkTheme.colors ? 'dark' : 'light'} theme`);
      set({ theme: newTheme });
    }
  },
  
  toggleMode: () => {
    const { mode } = get();
    const newMode = (mode === 'light' || mode === 'auto') ? 'dark' : 'light';
    Logger.info(`Toggling theme: ${mode} → ${newMode}`);
    get().setMode(newMode);
  },
}));
