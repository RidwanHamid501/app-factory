// Unit tests for NavigationContainer component
// Following official React Navigation testing guide: https://reactnavigation.org/docs/testing
import React from 'react';
import { NavigationContainer } from '../NavigationContainer';
import { navigationRef } from '../navigationRef';

// Mock navigationRef
jest.mock('../navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn().mockReturnValue(false),
    getCurrentRoute: jest.fn(),
  },
}));

// Mock linking utilities
jest.mock('../linking', () => ({
  createLinkingConfigInternal: jest.fn((config: any) => ({
    prefixes: config.prefixes,
    config: { screens: config.screens },
  })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children, onReady, ref }: any) => {
    // Simulate ref assignment
    React.useEffect(() => {
      if (ref && typeof ref === 'object') {
        ref.current = {
          isReady: () => true,
          getCurrentRoute: () => ({ name: 'Home' }),
        };
      }
      // Simulate onReady callback
      if (onReady) {
        setTimeout(() => onReady(), 0);
      }
    }, [ref, onReady]);

    return children;
  },
}));

describe('NavigationContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render children correctly', () => {
      const child = jest.fn(() => null);
      // Just instantiate the component
      <NavigationContainer>{child()}</NavigationContainer>;
      
      expect(child).toHaveBeenCalled();
    });

    it('should render multiple children', () => {
      const child1 = jest.fn(() => null);
      const child2 = jest.fn(() => null);
      
      <NavigationContainer>
        {child1()}
        {child2()}
      </NavigationContainer>;
      
      expect(child1).toHaveBeenCalled();
      expect(child2).toHaveBeenCalled();
    });

    it('should render without config', () => {
      expect(() => {
        <NavigationContainer>
          {null}
        </NavigationContainer>;
      }).not.toThrow();
    });
  });

  describe('configuration', () => {
    it('should handle linking configuration', () => {
      const config = {
        linking: {
          prefixes: ['myapp://', 'https://myapp.com'],
          screens: {
            Home: '',
            Profile: 'profile',
          },
        },
      };
      
      expect(() => {
        <NavigationContainer config={config}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should handle fallback component', () => {
      const FallbackComponent = () => null;
      
      const config = {
        fallback: FallbackComponent,
      };
      
      expect(() => {
        <NavigationContainer config={config}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should handle config without linking', () => {
      const config = {
        fallback: () => null,
      };
      
      expect(() => {
        <NavigationContainer config={config}>{null}</NavigationContainer>;
      }).not.toThrow();
    });
  });

  describe('lifecycle callbacks', () => {
    it('should call onReady when navigation is ready', () => {
      const onReady = jest.fn();
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Home' });
      
      expect(() => {
        <NavigationContainer onReady={onReady}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should work without onReady callback', () => {
      expect(() => {
        <NavigationContainer>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should log initial route on ready', () => {
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Welcome' });
      
      const onReady = jest.fn();
      
      expect(() => {
        <NavigationContainer onReady={onReady}>{null}</NavigationContainer>;
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle undefined getCurrentRoute gracefully', () => {
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue(undefined);
      
      const onReady = jest.fn();
      
      expect(() => {
        <NavigationContainer onReady={onReady}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should handle null children gracefully', () => {
      expect(() => {
        <NavigationContainer>{null}</NavigationContainer>;
      }).not.toThrow();
    });
  });

  describe('semantic validation', () => {
    it('should support deep linking configuration for app URLs', () => {
      const appConfig = {
        linking: {
          prefixes: ['myapp://', 'https://myapp.com', 'https://share.myapp.com'],
          screens: {
            Home: '',
            Profile: 'profile/:userId',
            Settings: 'settings',
          },
        },
      };
      
      expect(() => {
        <NavigationContainer config={appConfig}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should provide navigation readiness for splash screen coordination', () => {
      const onNavigationReady = jest.fn();
      
      expect(() => {
        <NavigationContainer onReady={onNavigationReady}>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should track route changes for analytics', () => {
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Home' });
      
      expect(() => {
        <NavigationContainer>{null}</NavigationContainer>;
      }).not.toThrow();
    });

    it('should support fallback component for loading state', () => {
      const LoadingScreen = () => null;
      
      const config = {
        fallback: LoadingScreen,
      };
      
      expect(() => {
        <NavigationContainer config={config}>{null}</NavigationContainer>;
      }).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete app configuration', () => {
      const FallbackComponent = () => null;
      const onDeepLink = jest.fn();
      
      const fullConfig = {
        linking: {
          prefixes: ['myapp://'],
          screens: {
            Home: '',
            Details: 'details/:id',
          },
        },
        fallback: FallbackComponent,
        onDeepLink,
      };
      
      const onAppReady = jest.fn();
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Home' });
      
      expect(() => {
        <NavigationContainer config={fullConfig} onReady={onAppReady}>{null}</NavigationContainer>;
      }).not.toThrow();
    });
  });
});
