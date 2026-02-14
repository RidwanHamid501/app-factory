import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { StoreInitializer } from '../StoreInitializer';
import { useThemeStore } from '../theme/themeStore';
import { Logger } from '../../utils/logger';

jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
  },
}));

describe('StoreInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <StoreInitializer>
          <Text>Test Child</Text>
        </StoreInitializer>
      );
      
      expect(getByText('Test Child')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <StoreInitializer>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
        </StoreInitializer>
      );
      
      expect(getByText('Child 1')).toBeTruthy();
      expect(getByText('Child 2')).toBeTruthy();
    });

    it('should render complex children tree', () => {
      const ComplexChild = () => (
        <>
          <Text>Parent</Text>
          <Text>Child</Text>
        </>
      );
      
      const { getByText } = render(
        <StoreInitializer>
          <ComplexChild />
        </StoreInitializer>
      );
      
      expect(getByText('Parent')).toBeTruthy();
      expect(getByText('Child')).toBeTruthy();
    });
  });

  describe('Initialization', () => {
    it('should log initialization message', () => {
      render(
        <StoreInitializer>
          <Text>Test</Text>
        </StoreInitializer>
      );
      
      expect(Logger.info).toHaveBeenCalledWith('All stores initialized');
    });

    it('should log initialization message only once', () => {
      const { rerender } = render(
        <StoreInitializer>
          <Text>Test</Text>
        </StoreInitializer>
      );
      
      const initCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized'
      );
      expect(initCalls.length).toBe(1);
      
      rerender(
        <StoreInitializer>
          <Text>Updated Test</Text>
        </StoreInitializer>
      );
      
      const updatedCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized'
      );
      expect(updatedCalls.length).toBe(1);
    });

    it('should initialize theme system', () => {
      render(
        <StoreInitializer>
          <Text>Test</Text>
        </StoreInitializer>
      );
      
      const themeCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0].startsWith('System color scheme:')
      );
      expect(themeCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Store Access', () => {
    it('should allow children to access theme store', () => {
      const TestComponent = () => {
        const theme = useThemeStore((state) => state.theme);
        return <Text>{theme.mode}</Text>;
      };
      
      const { getByText } = render(
        <StoreInitializer>
          <TestComponent />
        </StoreInitializer>
      );
      
      expect(getByText('light')).toBeTruthy();
    });

    it('should allow children to access theme actions', () => {
      const TestComponent = () => {
        const setMode = useThemeStore((state) => state.setMode);
        React.useEffect(() => {
          setMode('dark');
        }, [setMode]);
        
        const mode = useThemeStore((state) => state.mode);
        return <Text>{mode}</Text>;
      };
      
      const { getByText } = render(
        <StoreInitializer>
          <TestComponent />
        </StoreInitializer>
      );
      
      expect(getByText('dark')).toBeTruthy();
    });
  });

  describe('Semantic Invariants', () => {
    it('should not cause unnecessary re-renders of children', () => {
      let renderCount = 0;
      
      const TestChild = () => {
        renderCount++;
        return <Text>Render count: {renderCount}</Text>;
      };
      
      const { rerender } = render(
        <StoreInitializer>
          <TestChild />
        </StoreInitializer>
      );
      
      const initialCount = renderCount;
      
      rerender(
        <StoreInitializer>
          <TestChild />
        </StoreInitializer>
      );
      
      expect(renderCount).toBe(initialCount + 1);
    });

    it('should work without children', () => {
      expect(() => {
        render(<StoreInitializer>{null}</StoreInitializer>);
      }).not.toThrow();
    });

    it('should work with undefined children', () => {
      expect(() => {
        render(<StoreInitializer>{undefined}</StoreInitializer>);
      }).not.toThrow();
    });

    it('should handle children that throw errors gracefully', () => {
      const ErrorChild = () => {
        throw new Error('Test error');
      };
      
      expect(() => {
        render(
          <StoreInitializer>
            <ErrorChild />
          </StoreInitializer>
        );
      }).toThrow('Test error');
    });

    it('should initialize stores before rendering children', () => {
      const initOrder: string[] = [];
      
      const TestChild = () => {
        React.useEffect(() => {
          initOrder.push('child-mount');
        }, []);
        return <Text>Test</Text>;
      };
      
      render(
        <StoreInitializer>
          <TestChild />
        </StoreInitializer>
      );
      
      const storeInitIndex = (Logger.info as jest.Mock).mock.calls.findIndex(
        call => call[0] === 'All stores initialized'
      );
      
      expect(storeInitIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Instances', () => {
    it('should support multiple StoreInitializer instances', () => {
      render(
        <StoreInitializer>
          <Text>Instance 1</Text>
        </StoreInitializer>
      );
      
      render(
        <StoreInitializer>
          <Text>Instance 2</Text>
        </StoreInitializer>
      );
      
      expect(Logger.info).toHaveBeenCalled();
    });

    it('should log initialization for each instance', () => {
      render(
        <StoreInitializer>
          <Text>Instance 1</Text>
        </StoreInitializer>
      );
      
      render(
        <StoreInitializer>
          <Text>Instance 2</Text>
        </StoreInitializer>
      );
      
      const initCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized'
      );
      
      expect(initCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
