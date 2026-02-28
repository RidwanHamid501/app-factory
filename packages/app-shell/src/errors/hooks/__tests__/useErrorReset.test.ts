/* eslint-disable @typescript-eslint/no-require-imports */
import { renderHook } from '@testing-library/react-native';
import { useErrorReset } from '../useErrorReset';
import { Logger } from '../../../utils/logger';

jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    resetBoundary: jest.fn(),
  })),
}));

jest.mock('../../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
  },
}));

describe('useErrorReset', () => {
  let mockResetBoundary: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResetBoundary = jest.fn();
    const reactErrorBoundary = require('react-error-boundary');
    reactErrorBoundary.useErrorBoundary.mockReturnValue({
      resetBoundary: mockResetBoundary,
    });
  });

  describe('Success Cases - Basic functionality', () => {
    it('returns resetError function', () => {
      const { result } = renderHook(() => useErrorReset());
      
      expect(result.current).toHaveProperty('resetError');
      expect(typeof result.current.resetError).toBe('function');
    });

    it('calls resetBoundary when resetError is invoked', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();

      expect(mockResetBoundary).toHaveBeenCalledTimes(1);
    });

    it('logs reset action', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();

      expect(Logger.info).toHaveBeenCalledWith('[useErrorReset] Resetting error boundary');
    });
  });

  describe('Failure Cases - Multiple resets', () => {
    it('handles multiple reset calls', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();
      result.current.resetError();
      result.current.resetError();

      expect(mockResetBoundary).toHaveBeenCalledTimes(3);
      expect(Logger.info).toHaveBeenCalledTimes(3);
    });

    it('handles rapid successive resets', () => {
      const { result } = renderHook(() => useErrorReset());

      for (let i = 0; i < 10; i++) {
        result.current.resetError();
      }

      expect(mockResetBoundary).toHaveBeenCalledTimes(10);
    });
  });

  describe('Semantic Tests - Reset behavior', () => {
    it('clears error state by calling resetBoundary', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();

      expect(mockResetBoundary).toHaveBeenCalledWith();
      expect(mockResetBoundary).toHaveBeenCalledTimes(1);
    });

    it('logs each reset attempt for debugging', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();
      result.current.resetError();

      expect(Logger.info).toHaveBeenCalledTimes(2);
      expect(Logger.info).toHaveBeenCalledWith('[useErrorReset] Resetting error boundary');
    });

    it('does not pass arguments to resetBoundary', () => {
      const { result } = renderHook(() => useErrorReset());

      result.current.resetError();

      expect(mockResetBoundary).toHaveBeenCalledWith();
    });
  });

  describe('Semantic Tests - Usage patterns', () => {
    it('works when called from button press handler', () => {
      const { result } = renderHook(() => useErrorReset());
      
      // Simulate button press calling reset
      const handleButtonPress = () => {
        result.current.resetError();
      };

      handleButtonPress();

      expect(mockResetBoundary).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalled();
    });

    it('works when called from timeout callback', () => {
      const { result } = renderHook(() => useErrorReset());
      
      // Simulate auto-retry after timeout
      const autoRetry = () => {
        setTimeout(() => {
          result.current.resetError();
        }, 0);
      };

      autoRetry();

      // Wait for timeout
      jest.runAllTimers();
    });

    it('maintains state through component updates', () => {
      const { result } = renderHook(() => useErrorReset());
      
      result.current.resetError();
      expect(mockResetBoundary).toHaveBeenCalledTimes(1);

      // Calling reset again should still work
      result.current.resetError();
      expect(mockResetBoundary).toHaveBeenCalledTimes(2);
    });
  });

  describe('Semantic Tests - Function stability', () => {
    it('maintains reference stability across calls', () => {
      const { result } = renderHook(() => useErrorReset());
      const firstReset = result.current.resetError;

      result.current.resetError();
      
      expect(result.current.resetError).toBe(firstReset);
    });

    it('does not recreate function on multiple calls', () => {
      const { result } = renderHook(() => useErrorReset());
      const initialReset = result.current.resetError;

      result.current.resetError();
      result.current.resetError();
      
      expect(result.current.resetError).toBe(initialReset);
    });

    it('maintains stable object reference', () => {
      const { result } = renderHook(() => useErrorReset());
      const firstResult = result.current;

      result.current.resetError();
      
      expect(result.current).toBe(firstResult);
    });
  });

  describe('Semantic Tests - Integration scenarios', () => {
    it('coordinates with error boundary lifecycle', () => {
      const { result } = renderHook(() => useErrorReset());
      
      // First error occurs and is reset
      result.current.resetError();
      expect(mockResetBoundary).toHaveBeenCalledTimes(1);
      
      // Second error occurs and is reset
      result.current.resetError();
      expect(mockResetBoundary).toHaveBeenCalledTimes(2);
      
      expect(Logger.info).toHaveBeenCalledTimes(2);
    });

    it('works independently from error handler hook', () => {
      const { result } = renderHook(() => useErrorReset());
      
      // Reset should work regardless of how error was triggered
      result.current.resetError();

      expect(mockResetBoundary).toHaveBeenCalled();
    });
  });
});
