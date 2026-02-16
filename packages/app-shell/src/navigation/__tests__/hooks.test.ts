// Unit tests for typed navigation hooks
// Following official React Navigation testing guide: https://reactnavigation.org/docs/testing
import { renderHook } from '@testing-library/react-native';
import { useTypedNavigation } from '../hooks/useTypedNavigation';
import { useTypedRoute } from '../hooks/useTypedRoute';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock React Navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

describe('useTypedNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful navigation access', () => {
    it('should return navigation object with navigate function', () => {
      const mockNavigate = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ 
        navigate: mockNavigate,
        goBack: jest.fn(),
      });
      
      const { result } = renderHook(() => useTypedNavigation());
      
      expect(result.current).toBeDefined();
      expect(result.current.navigate).toBe(mockNavigate);
    });

    it('should return navigation object with all navigation methods', () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        push: jest.fn(),
        pop: jest.fn(),
        popToTop: jest.fn(),
        reset: jest.fn(),
      };
      (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
      
      const { result } = renderHook(() => useTypedNavigation());
      
      expect(result.current).toHaveProperty('navigate');
      expect(result.current).toHaveProperty('goBack');
      expect(result.current).toHaveProperty('push');
      expect(result.current).toHaveProperty('pop');
    });

    it('should maintain type safety with custom param list', () => {
      type AppParamList = {
        Home: undefined;
        Profile: { userId: string };
        Settings: { tab: string };
      };

      const mockNavigate = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
      
      const { result } = renderHook(() => useTypedNavigation<AppParamList>());
      
      // TypeScript should enforce correct types at compile time
      expect(result.current.navigate).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle undefined navigation gracefully', () => {
      (useNavigation as jest.Mock).mockReturnValue(undefined);
      
      const { result } = renderHook(() => useTypedNavigation());
      
      expect(result.current).toBeUndefined();
    });

    it('should throw error when used outside NavigationContainer', () => {
      const error = new Error('Navigation context not found');
      (useNavigation as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      expect(() => {
        renderHook(() => useTypedNavigation());
      }).toThrow(error);
    });
  });

  describe('semantic validation', () => {
    it('should provide type-safe navigation for screen components', () => {
      // Simulates a screen component using typed navigation
      type ScreenParams = {
        Home: undefined;
        Details: { id: string };
      };

      const mockNavigate = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ navigate: mockNavigate });
      
      const { result } = renderHook(() => useTypedNavigation<ScreenParams>());
      
      // Should be able to navigate with type safety
      result.current.navigate('Details', { id: '123' });
      expect(mockNavigate).toHaveBeenCalledWith('Details', { id: '123' });
    });

    it('should support navigation actions from user interactions', () => {
      // Simulates button press in UI
      const mockGoBack = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack });
      
      const { result } = renderHook(() => useTypedNavigation());
      
      // User presses back button
      result.current.goBack();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});

describe('useTypedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful route access', () => {
    it('should return route object with name and params', () => {
      const mockRoute = {
        name: 'Profile',
        params: { userId: '123' },
        key: 'Profile-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute());
      
      expect(result.current.name).toBe('Profile');
      expect(result.current.params).toEqual({ userId: '123' });
    });

    it('should return route without params', () => {
      const mockRoute = {
        name: 'Home',
        key: 'Home-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute());
      
      expect(result.current.name).toBe('Home');
      expect(result.current.params).toBeUndefined();
    });

    it('should handle complex params object', () => {
      const complexParams = {
        userId: '123',
        tab: 'posts',
        filters: { status: 'active', category: 'tech' },
      };
      const mockRoute = {
        name: 'Profile',
        params: complexParams,
        key: 'Profile-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute());
      
      expect(result.current.params).toEqual(complexParams);
    });
  });

  describe('error handling', () => {
    it('should handle undefined route gracefully', () => {
      (useRoute as jest.Mock).mockReturnValue(undefined);
      
      const { result } = renderHook(() => useTypedRoute());
      
      expect(result.current).toBeUndefined();
    });

    it('should throw error when used outside NavigationContainer', () => {
      const error = new Error('Route context not found');
      (useRoute as jest.Mock).mockImplementation(() => {
        throw error;
      });
      
      expect(() => {
        renderHook(() => useTypedRoute());
      }).toThrow(error);
    });
  });

  describe('semantic validation', () => {
    it('should provide type-safe route params for screen rendering', () => {
      // Simulates a screen reading its params to render content
      type RouteParams = {
        Profile: { userId: string; tab?: string };
      };

      const mockRoute = {
        name: 'Profile',
        params: { userId: '123', tab: 'posts' },
        key: 'Profile-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute<RouteParams, 'Profile'>());
      
      // Screen can safely access typed params
      expect(result.current.params?.userId).toBe('123');
      expect(result.current.params?.tab).toBe('posts');
    });

    it('should support conditional rendering based on params', () => {
      // Simulates screen showing different content based on params
      const mockRoute = {
        name: 'Details',
        params: { mode: 'edit' },
        key: 'Details-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute());
      
      // Screen uses params to decide what to render
      const isEditMode = (result.current.params as any)?.mode === 'edit';
      expect(isEditMode).toBe(true);
    });

    it('should provide route name for analytics tracking', () => {
      // Simulates screen tracking analytics with route name
      const mockRoute = {
        name: 'ProductDetails',
        params: { productId: '456' },
        key: 'ProductDetails-key',
      };
      (useRoute as jest.Mock).mockReturnValue(mockRoute);
      
      const { result } = renderHook(() => useTypedRoute());
      
      // Analytics can track screen view
      expect(result.current.name).toBe('ProductDetails');
    });
  });
});
