import {
  setDeletionCallback,
  type DeletionCallback,
} from '../../deletion/request';

jest.mock('../../utils/logger', () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Account Deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setDeletionCallback', () => {
    it('should register deletion callback', () => {
      const callback: DeletionCallback = jest.fn();

      expect(() => setDeletionCallback(callback)).not.toThrow();
    });

    it('should accept async callback function', () => {
      const callback: DeletionCallback = async (userId, credentials) => {
        await Promise.resolve();
      };

      expect(() => setDeletionCallback(callback)).not.toThrow();
    });

    it('should allow updating callback', () => {
      const callback1: DeletionCallback = jest.fn();
      const callback2: DeletionCallback = jest.fn();

      setDeletionCallback(callback1);
      expect(() => setDeletionCallback(callback2)).not.toThrow();
    });
  });
});
