// Theme hooks tests
// Official React Native testing docs: https://jestjs.io/docs/tutorial-react-native

import { renderHook, act } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import {
  useInitializeTheme,
  useTheme,
  useThemeMode,
  useThemeActions,
  useThemeColors,
  useTypography,
  useSpacing,
  useIsDarkMode,
} from '../hooks';
import { useThemeStore } from '../themeStore';
import { defaultLightTheme, defaultDarkTheme } from '../defaultTheme';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('Theme Hooks', () => {
  beforeEach(() => {
    // Reset store
    useThemeStore.setState({
      mode: 'auto',
      systemColorScheme: null,
      theme: defaultLightTheme,
    });
    
    // Reset mock
    mockUseColorScheme.mockReturnValue(null);
  });

  describe('useInitializeTheme', () => {
    // Success test: initializes with system color scheme
    it('should initialize theme system with system color scheme', () => {
      mockUseColorScheme.mockReturnValue('dark');
      
      renderHook(() => useInitializeTheme());
      
      const state = useThemeStore.getState();
      expect(state.systemColorScheme).toBe('dark');
    });

    // Success test: updates when system changes
    it('should update when system color scheme changes', () => {
      mockUseColorScheme.mockReturnValue('light');
      
      renderHook(() => useInitializeTheme());
      
      expect(useThemeStore.getState().systemColorScheme).toBe('light');
      
      // Simulate system change by remounting hook
      mockUseColorScheme.mockReturnValue('dark');
      renderHook(() => useInitializeTheme());
      
      expect(useThemeStore.getState().systemColorScheme).toBe('dark');
    });
  });

  describe('useTheme', () => {
    // Success test: returns current theme
    it('should return current theme', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current).toEqual(defaultLightTheme);
    });

    // Success test: updates when theme changes
    it('should update when theme changes', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        useThemeStore.getState().setMode('dark');
      });
      
      expect(result.current).toEqual(defaultDarkTheme);
    });
  });

  describe('useThemeMode', () => {
    // Success test: returns current mode
    it('should return current theme mode', () => {
      const { result } = renderHook(() => useThemeMode());
      
      expect(result.current).toBe('auto');
    });

    // Success test: updates when mode changes
    it('should update when mode changes', () => {
      renderHook(() => useThemeMode());
      
      act(() => {
        useThemeStore.getState().setMode('dark');
      });
      
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });

  describe('useThemeActions', () => {
    // Success test: returns actions
    it('should return theme actions', () => {
      const { result } = renderHook(() => useThemeActions());
      
      expect(result.current.setMode).toBeDefined();
      expect(result.current.toggleMode).toBeDefined();
      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.toggleMode).toBe('function');
    });

    // Success test: setMode works
    it('should update mode via setMode action', () => {
      const { result } = renderHook(() => useThemeActions());
      
      act(() => {
        result.current.setMode('dark');
      });
      
      expect(useThemeStore.getState().mode).toBe('dark');
    });

    // Success test: toggleMode works
    it('should toggle mode via toggleMode action', () => {
      const { result } = renderHook(() => useThemeActions());
      
      act(() => {
        result.current.toggleMode();
      });
      
      expect(useThemeStore.getState().mode).toBe('dark');
    });
  });

  describe('useThemeColors', () => {
    // Success test: returns colors
    it('should return theme colors', () => {
      const { result } = renderHook(() => useThemeColors());
      
      expect(result.current).toEqual(defaultLightTheme.colors);
    });

    // Success test: updates when theme changes
    it('should update when theme changes', () => {
      const { result } = renderHook(() => useThemeColors());
      
      act(() => {
        useThemeStore.getState().setMode('dark');
      });
      
      expect(result.current).toEqual(defaultDarkTheme.colors);
    });
  });

  describe('useTypography', () => {
    // Success test: returns typography
    it('should return typography', () => {
      const { result } = renderHook(() => useTypography());
      
      expect(result.current).toEqual(defaultLightTheme.typography);
      expect(result.current.fontFamily).toBe('System');
      expect(result.current.fontSize.base).toBe(16);
    });
  });

  describe('useSpacing', () => {
    // Success test: returns spacing
    it('should return spacing', () => {
      const { result } = renderHook(() => useSpacing());
      
      expect(result.current).toEqual(defaultLightTheme.spacing);
      expect(result.current.md).toBe(16);
    });
  });

  describe('useIsDarkMode', () => {
    // Success test: returns false for light mode
    it('should return false for light mode', () => {
      const { result } = renderHook(() => useIsDarkMode());
      
      act(() => {
        useThemeStore.getState().setMode('light');
      });
      
      expect(result.current).toBe(false);
    });

    // Success test: returns true for dark mode
    it('should return true for dark mode', () => {
      const { result } = renderHook(() => useIsDarkMode());
      
      act(() => {
        useThemeStore.getState().setMode('dark');
      });
      
      expect(result.current).toBe(true);
    });
  });

  describe('Semantic Tests - Hook Behavioral Invariants', () => {
    // Invariant: Hooks always return consistent data with store
    it('should always match store values', () => {
      const themeHook = renderHook(() => useTheme());
      const modeHook = renderHook(() => useThemeMode());
      const colorsHook = renderHook(() => useThemeColors());
      
      const storeState = useThemeStore.getState();
      
      expect(themeHook.result.current).toEqual(storeState.theme);
      expect(modeHook.result.current).toBe(storeState.mode);
      expect(colorsHook.result.current).toEqual(storeState.theme.colors);
    });

    // Behavioral: Granular hooks subscribe to specific slices
    it('should provide granular access to theme properties', () => {
      const colors = renderHook(() => useThemeColors());
      const typography = renderHook(() => useTypography());
      const spacing = renderHook(() => useSpacing());
      
      // Each hook returns its specific slice
      expect(colors.result.current).toHaveProperty('primary');
      expect(typography.result.current).toHaveProperty('fontFamily');
      expect(spacing.result.current).toHaveProperty('md');
    });

    // Invariant: isDarkMode reflects actual theme mode
    it('should correctly reflect dark mode state', () => {
      const { result } = renderHook(() => useIsDarkMode());
      
      act(() => {
        useThemeStore.getState().setMode('light');
      });
      expect(result.current).toBe(false);
      
      act(() => {
        useThemeStore.getState().setMode('dark');
      });
      expect(result.current).toBe(true);
    });
  });
});
