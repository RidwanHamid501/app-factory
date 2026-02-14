// Default theme configurations

import { Theme } from './types';

const lightColors = {
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  secondary: '#5856D6',
  secondaryLight: '#AF52DE',
  secondaryDark: '#3634A3',
  background: '#FFFFFF',
  backgroundElevated: '#F2F2F7',
  backgroundSecondary: '#F9F9F9',
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',
  border: '#C6C6C8',
  divider: '#E5E5EA',
  overlay: 'rgba(0, 0, 0, 0.4)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  activeOpacity: 0.7,
  disabledOpacity: 0.4,
};

const darkColors = {
  primary: '#0A84FF',
  primaryLight: '#64D2FF',
  primaryDark: '#0051D5',
  secondary: '#BF5AF2',
  secondaryLight: '#DA8FFF',
  secondaryDark: '#9A5DC9',
  background: '#000000',
  backgroundElevated: '#1C1C1E',
  backgroundSecondary: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  textInverse: '#000000',
  border: '#38383A',
  divider: '#48484A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  activeOpacity: 0.7,
  disabledOpacity: 0.4,
};

const typography = {
  fontFamily: 'System',
  fontFamilyBold: 'System',
  fontFamilyMedium: 'System',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const defaultLightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
};

export const defaultDarkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
};
