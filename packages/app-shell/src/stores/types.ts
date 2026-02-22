// Store configuration types - Official docs: https://react.dev/reference/react/createContext
import type { Theme, ThemeMode } from './theme/types';

export interface StoreConfig {
  theme?: ThemeConfig;
  settings?: SettingsConfig;
  featureFlags?: Record<string, boolean | string | number>;
}

export interface ThemeConfig {
  defaultMode?: ThemeMode;
  followSystem?: boolean;
  customTheme?: {
    light?: Partial<Theme>;
    dark?: Partial<Theme>;
  };
}

export interface SettingsConfig {
  language?: string;
  currency?: string;
  units?: 'metric' | 'imperial';
  notifications?: boolean;
  [key: string]: any;
}
