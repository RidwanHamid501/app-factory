// logger.test.ts - Tests for logger utility
// Official testing docs: https://jestjs.io/docs/tutorial-react-native

import { Logger } from '../logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('debug', () => {
    // Success test: logs in development mode (__DEV__ is true by default in jest.setup.js)
    it('should log debug messages in development mode', () => {
      Logger.debug('Test message', 'arg1', 'arg2');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AppShell] Test message',
        'arg1',
        'arg2'
      );
    });

    // Note: Cannot test production mode since __DEV__ is set at class instantiation time
    // and Logger is a singleton. This would require module mocking which adds complexity.
  });

  describe('info', () => {
    // Success test: always logs info messages
    it('should log info messages with prefix and arguments', () => {
      Logger.info('Info message', { data: 'test' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[AppShell] Info message',
        { data: 'test' }
      );
    });

    // Success test: handles string messages
    it('should log simple string info messages', () => {
      Logger.info('Info message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[AppShell] Info message');
    });
  });

  describe('warn', () => {
    // Success test: logs warnings
    it('should log warning messages', () => {
      Logger.warn('Warning message', 123);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[AppShell] Warning message',
        123
      );
    });

    // Success test: includes prefix
    it('should include [AppShell] prefix in warnings', () => {
      Logger.warn('Test');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AppShell]')
      );
    });
  });

  describe('error', () => {
    // Success test: logs errors
    it('should log error messages', () => {
      const error = new Error('Test error');
      
      Logger.error('Error occurred', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppShell] Error occurred',
        error
      );
    });

    // Success test: handles multiple arguments
    it('should handle multiple error arguments', () => {
      Logger.error('Multiple', 'error', 'args');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AppShell] Multiple',
        'error',
        'args'
      );
    });
  });

  describe('Semantic Tests - Logger Behavioral Invariants', () => {
    // Behavioral: Prefix consistency for all log types
    it('should always prefix messages with [AppShell] tag', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      Logger.info('info message');
      Logger.warn('warn message');
      Logger.error('error message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[AppShell] info message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[AppShell] warn message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[AppShell] error message');
      
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    // Behavioral: Multiple arguments are preserved
    it('should preserve all message arguments in output', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      
      Logger.info('Message', obj, arr);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[AppShell] Message', obj, arr);
      
      consoleLogSpy.mockRestore();
    });

    // Invariant: Log methods never throw errors
    it('should handle all input types without throwing', () => {
      expect(() => {
        Logger.info(null as unknown as string);
        Logger.info(undefined as unknown as string);
        Logger.info(123 as unknown as string);
        Logger.info({} as unknown as string);
        Logger.info([] as unknown as string);
      }).not.toThrow();
    });

    // Behavioral: Logger maintains singleton pattern
    it('should use same console methods regardless of call count', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      // Multiple calls should all use the same console.log
      Logger.info('First');
      Logger.info('Second');
      Logger.info('Third');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      
      consoleLogSpy.mockRestore();
    });
  });
});
