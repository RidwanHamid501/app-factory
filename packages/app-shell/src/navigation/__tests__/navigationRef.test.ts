// Unit tests for imperative navigation
// Following official React Navigation testing guide: https://reactnavigation.org/docs/testing
import { navigate, goBack, resetRoot, getCurrentRouteName, getCurrentRouteParams } from '../navigationRef';
import { navigationRef } from '../navigationRef';
import { Logger } from '../../utils/logger';

// Mock Logger
jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock navigationRef methods
jest.spyOn(navigationRef, 'isReady');
jest.spyOn(navigationRef, 'canGoBack');
jest.spyOn(navigationRef, 'navigate');
jest.spyOn(navigationRef, 'goBack');
jest.spyOn(navigationRef, 'resetRoot');
jest.spyOn(navigationRef, 'getCurrentRoute');

describe('navigationRef', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigate', () => {
    it('should navigate when ref is ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      
      navigate('Profile', { userId: '123' });
      
      expect(navigationRef.navigate).toHaveBeenCalledWith('Profile', { userId: '123' });
      expect(Logger.info).toHaveBeenCalledWith('Navigating to Profile', { userId: '123' });
    });

    it('should log warning when ref is not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      
      navigate('Profile', { userId: '123' });
      
      expect(navigationRef.navigate).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith('Navigation not ready, cannot navigate to Profile');
    });
  });

  describe('goBack', () => {
    it('should go back when ref is ready and can go back', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(true);
      
      goBack();
      
      expect(navigationRef.goBack).toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledWith('Navigating back');
    });

    it('should not go back when cannot go back', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(false);
      
      goBack();
      
      expect(navigationRef.goBack).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith('Cannot go back - either not ready or no history');
    });

    it('should not go back when ref is not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      
      goBack();
      
      expect(navigationRef.goBack).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith('Cannot go back - either not ready or no history');
    });
  });

  describe('resetRoot', () => {
    it('should reset navigation when ref is ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      
      resetRoot('Home', { refresh: true });
      
      expect(navigationRef.resetRoot).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home', params: { refresh: true } }],
      });
      expect(Logger.info).toHaveBeenCalledWith('Resetting navigation to Home');
    });

    it('should log warning when ref is not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      
      resetRoot('Home');
      
      expect(navigationRef.resetRoot).not.toHaveBeenCalled();
      expect(Logger.warn).toHaveBeenCalledWith('Navigation not ready, cannot reset');
    });
  });

  describe('getCurrentRouteName', () => {
    it('should return current route name when ref is ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Profile', params: {} });
      
      const result = getCurrentRouteName();
      
      expect(result).toBe('Profile');
    });

    it('should return undefined when ref is not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      
      const result = getCurrentRouteName();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when no current route', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue(undefined);
      
      const result = getCurrentRouteName();
      
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentRouteParams', () => {
    it('should return current route params when ref is ready', () => {
      const mockParams = { userId: '123' };
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue({ name: 'Profile', params: mockParams });
      
      const result = getCurrentRouteParams();
      
      expect(result).toEqual(mockParams);
    });

    it('should return undefined when ref is not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      
      const result = getCurrentRouteParams();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when no current route', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      (navigationRef.getCurrentRoute as jest.Mock).mockReturnValue(undefined);
      
      const result = getCurrentRouteParams();
      
      expect(result).toBeUndefined();
    });
  });
});
