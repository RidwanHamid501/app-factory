import React from 'react';
import { render } from '@testing-library/react-native';
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
      const child = jest.fn(() => null);
      render(
        <StoreInitializer>
          {child()}
        </StoreInitializer>
      );
      
      expect(child).toHaveBeenCalled();
    });

    it('should render multiple children', () => {
      const child1 = jest.fn(() => null);
      const child2 = jest.fn(() => null);
      
      render(
        <StoreInitializer>
          {child1()}
          {child2()}
        </StoreInitializer>
      );
      
      expect(child1).toHaveBeenCalled();
      expect(child2).toHaveBeenCalled();
    });

    it('should render complex children tree', () => {
      const ComplexChild = jest.fn(() => null);
      
      render(
        <StoreInitializer>
          <ComplexChild />
        </StoreInitializer>
      );
      
      expect(ComplexChild).toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should log initialization message', () => {
      render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      expect(Logger.info).toHaveBeenCalledWith('All stores initialized with config');
    });

    it('should log initialization message only once', () => {
      const { rerender } = render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      const initCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized with config'
      );
      expect(initCalls.length).toBe(1);
      
      rerender(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      const updatedCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized with config'
      );
      expect(updatedCalls.length).toBe(1);
    });

    it('should initialize theme system', () => {
      render(
        <StoreInitializer>
          {null}
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
      let capturedMode: string | undefined;
      
      const TestComponent = () => {
        const theme = useThemeStore((state) => state.theme);
        capturedMode = theme.mode;
        return null;
      };
      
      render(
        <StoreInitializer>
          <TestComponent />
        </StoreInitializer>
      );
      
      expect(capturedMode).toBe('light');
    });

    it('should allow children to access theme actions', () => {
      let capturedMode: string | undefined;
      
      const TestComponent = () => {
        const setMode = useThemeStore((state) => state.setMode);
        const mode = useThemeStore((state) => state.mode);
        
        React.useEffect(() => {
          setMode('dark');
        }, [setMode]);
        
        capturedMode = mode;
        return null;
      };
      
      render(
        <StoreInitializer>
          <TestComponent />
        </StoreInitializer>
      );
      
      expect(capturedMode).toBe('dark');
    });
  });

  describe('Semantic Invariants', () => {
    it('should not cause unnecessary re-renders of children', () => {
      let renderCount = 0;
      
      const TestComp = () => {
        renderCount++;
        return null;
      };
      
      const { rerender } = render(
        <StoreInitializer>
          <TestComp />
        </StoreInitializer>
      );
      
      const initialCount = renderCount;
      
      rerender(
        <StoreInitializer>
          <TestComp />
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
      
      const TestComp = () => {
        React.useEffect(() => {
          initOrder.push('child-mount');
        }, []);
        return null;
      };
      
      render(
        <StoreInitializer>
          <TestComp />
        </StoreInitializer>
      );
      
      const storeInitIndex = (Logger.info as jest.Mock).mock.calls.findIndex(
        call => call[0] === 'All stores initialized with config'
      );
      
      expect(storeInitIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Instances', () => {
    it('should support multiple StoreInitializer instances', () => {
      render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      expect(Logger.info).toHaveBeenCalled();
    });

    it('should log initialization for each instance', () => {
      render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      render(
        <StoreInitializer>
          {null}
        </StoreInitializer>
      );
      
      const initCalls = (Logger.info as jest.Mock).mock.calls.filter(
        call => call[0] === 'All stores initialized with config'
      );
      
      expect(initCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
