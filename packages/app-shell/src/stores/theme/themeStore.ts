import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';
import { Theme, ThemeMode } from './types';
import { defaultLightTheme, defaultDarkTheme } from './defaultTheme';
import { Logger } from '../../utils/logger';

interface ThemeStore {
  mode: ThemeMode;
  theme: Theme;
  systemColorScheme: ColorSchemeName;
  customThemes?: {
    light?: Partial<Theme>;
    dark?: Partial<Theme>;
  };
  setMode: (mode: ThemeMode) => void;
  setSystemColorScheme: (scheme: ColorSchemeName) => void;
  setCustomThemes: (themes: { light?: Partial<Theme>, dark?: Partial<Theme> }) => void;
  toggleMode: () => void;
}

function mergeThemes(baseTheme: Theme, customTheme?: Partial<Theme>): Theme {
  if (!customTheme) return baseTheme;
  
  return {
    ...baseTheme,
    colors: { ...baseTheme.colors, ...customTheme.colors },
    typography: { ...baseTheme.typography, ...customTheme.typography },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
  };
}

function getEffectiveTheme(
  mode: ThemeMode, 
  systemScheme: ColorSchemeName,
  customThemes?: { light?: Partial<Theme>, dark?: Partial<Theme> }
): Theme {
  const isDark = mode === 'auto' ? systemScheme === 'dark' : mode === 'dark';
  const baseTheme = isDark ? defaultDarkTheme : defaultLightTheme;
  const customTheme = customThemes ? (isDark ? customThemes.dark : customThemes.light) : undefined;
  
  return mergeThemes(baseTheme, customTheme);
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  mode: 'auto',
  systemColorScheme: null,
  theme: defaultLightTheme,
  customThemes: undefined,
  
  setMode: (mode: ThemeMode) => {
    const { systemColorScheme, customThemes } = get();
    Logger.info(`Setting theme mode to: ${mode} (system: ${systemColorScheme})`);
    const effectiveTheme = getEffectiveTheme(mode, systemColorScheme, customThemes);
    Logger.info(`Applying ${effectiveTheme.colors === defaultDarkTheme.colors ? 'dark' : 'light'} theme`);
    set({ mode, theme: effectiveTheme });
  },
  
  setSystemColorScheme: (scheme: ColorSchemeName) => {
    Logger.info(`System color scheme changed to: ${scheme}`);
    const { mode, customThemes } = get();
    set({ systemColorScheme: scheme });
    
    if (mode === 'auto') {
      const newTheme = getEffectiveTheme(mode, scheme, customThemes);
      Logger.info(`Auto mode: applying ${newTheme.colors === defaultDarkTheme.colors ? 'dark' : 'light'} theme`);
      set({ theme: newTheme });
    }
  },
  
  setCustomThemes: (themes) => {
    Logger.info('[Theme] Setting custom themes');
    const { mode, systemColorScheme } = get();
    set({ customThemes: themes });
    const effectiveTheme = getEffectiveTheme(mode, systemColorScheme, themes);
    set({ theme: effectiveTheme });
  },
  
  toggleMode: () => {
    const { mode } = get();
    const newMode = (mode === 'light' || mode === 'auto') ? 'dark' : 'light';
    Logger.info(`Toggling theme: ${mode} → ${newMode}`);
    get().setMode(newMode);
  },
}));
