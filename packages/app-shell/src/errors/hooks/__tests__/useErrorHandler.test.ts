/* eslint-disable @typescript-eslint/no-require-imports */
import { renderHook } from '@testing-library/react-native';
import { useErrorHandler } from '../useErrorHandler';
import { Logger } from '../../../utils/logger';

jest.mock('react-error-boundary', () => ({
  useErrorBoundary: jest.fn(() => ({
    showBoundary: jest.fn(),
    resetBoundary: jest.fn(),
  })),
}));

jest.mock('../../../utils/logger', () => ({
  Logger: {
    error: jest.fn(),
  },
}));

describe('useErrorHandler', () => {
  let mockShowBoundary: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowBoundary = jest.fn();
    const reactErrorBoundary = require('react-error-boundary');
    reactErrorBoundary.useErrorBoundary.mockReturnValue({
      showBoundary: mockShowBoundary,
      resetBoundary: jest.fn(),
    });
  });

  describe('Success Cases - Basic functionality', () => {
    it('returns a function', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      expect(typeof result.current).toBe('function');
    });

    it('triggers error boundary when called with error', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current(error);

      expect(mockShowBoundary).toHaveBeenCalledWith(error);
      expect(mockShowBoundary).toHaveBeenCalledTimes(1);
    });

    it('handles multiple error types', () => {
      const { result } = renderHook(() => useErrorHandler());
      const networkError = new Error('Network failed');
      const validationError = new Error('Validation failed');

      result.current(networkError);
      result.current(validationError);

      expect(mockShowBoundary).toHaveBeenCalledTimes(2);
      expect(mockShowBoundary).toHaveBeenNthCalledWith(1, networkError);
      expect(mockShowBoundary).toHaveBeenNthCalledWith(2, validationError);
    });
  });

  describe('Failure Cases - Error handling', () => {
    it('handles errors with empty messages', () => {
      const { result } = renderHook(() => useErrorHandler());
      const emptyError = new Error('');

      result.current(emptyError);

      expect(mockShowBoundary).toHaveBeenCalledWith(emptyError);
      expect(Logger.error).toHaveBeenCalled();
    });

    it('handles errors without stack traces', () => {
      const { result } = renderHook(() => useErrorHandler());
      const errorNoStack = new Error('No stack');
      delete errorNoStack.stack;

      result.current(errorNoStack);

      expect(mockShowBoundary).toHaveBeenCalledWith(errorNoStack);
    });

    it('handles calling with undefined context', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test');

      result.current(error, undefined);

      expect(Logger.error).toHaveBeenCalledWith(
        '[useErrorHandler] Manually triggered error:',
        {
          message: 'Test',
          context: undefined,
        }
      );
    });
  });

  describe('Semantic Tests - Context logging', () => {
    it('logs error with context information', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');
      const context = { userId: '123', action: 'submit' };

      result.current(error, context);

      expect(Logger.error).toHaveBeenCalledWith(
        '[useErrorHandler] Manually triggered error:',
        {
          message: 'Test error',
          context,
        }
      );
    });

    it('logs error without context when not provided', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test error');

      result.current(error);

      expect(Logger.error).toHaveBeenCalledWith(
        '[useErrorHandler] Manually triggered error:',
        {
          message: 'Test error',
          context: undefined,
        }
      );
    });

    it('logs different context types correctly', () => {
      const { result } = renderHook(() => useErrorHandler());
      const error = new Error('Test');

      result.current(error, { type: 'network', endpoint: '/api/users' });
      result.current(error, { component: 'LoginForm', field: 'email' });
      result.current(error, { timestamp: Date.now(), severity: 'high' });

      expect(Logger.error).toHaveBeenCalledTimes(3);
    });
  });

  describe('Semantic Tests - Usage patterns', () => {
    it('works in async error handling scenario', () => {
      const { result } = renderHook(() => useErrorHandler());
      const asyncError = new Error('Async operation failed');

      result.current(asyncError, { 
        operation: 'fetchUserData',
        timestamp: Date.now() 
      });

      expect(mockShowBoundary).toHaveBeenCalledWith(asyncError);
      expect(Logger.error).toHaveBeenCalledWith(
        '[useErrorHandler] Manually triggered error:',
        expect.objectContaining({
          message: 'Async operation failed',
          context: expect.objectContaining({
            operation: 'fetchUserData',
          }),
        })
      );
    });

    it('works in event handler error scenario', () => {
      const { result } = renderHook(() => useErrorHandler());
      const eventError = new Error('Button click failed');

      result.current(eventError, { 
        event: 'onClick',
        target: 'SubmitButton' 
      });

      expect(mockShowBoundary).toHaveBeenCalledWith(eventError);
    });

    it('handles sequential errors independently', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      result.current(new Error('First error'), { step: 1 });
      result.current(new Error('Second error'), { step: 2 });
      result.current(new Error('Third error'), { step: 3 });

      expect(mockShowBoundary).toHaveBeenCalledTimes(3);
      expect(Logger.error).toHaveBeenCalledTimes(3);
    });
  });

  describe('Semantic Tests - Function stability', () => {
    it('maintains reference stability across renders', () => {
      const { result } = renderHook(() => useErrorHandler());
      const firstHandler = result.current;
      
      const error = new Error('Test');
      result.current(error);
      
      expect(result.current).toBe(firstHandler);
    });

    it('does not recreate function unnecessarily', () => {
      const { result } = renderHook(() => useErrorHandler());
      const initialHandler = result.current;

      // Calling the handler shouldn't change the reference
      result.current(new Error('Test'));
      
      expect(result.current).toBe(initialHandler);
    });
  });
});
