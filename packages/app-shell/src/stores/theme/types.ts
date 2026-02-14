// Theme types

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  backgroundElevated: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  border: string;
  divider: string;
  overlay: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  activeOpacity: number;
  disabledOpacity: number;
}

export interface Typography {
  fontFamily: string;
  fontFamilyBold: string;
  fontFamilyMedium: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  lineHeight: {
    tight: number;
    base: number;
    relaxed: number;
  };
  fontWeight: {
    normal: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}
