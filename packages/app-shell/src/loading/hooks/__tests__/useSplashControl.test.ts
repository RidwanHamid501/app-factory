import { renderHook, act } from '@testing-library/react-native';
import { useSplashControl } from '../useSplashControl';
import * as SplashController from '../../SplashController';

jest.mock('../../SplashController', () => ({
  hideSplash: jest.fn().mockResolvedValue(undefined),
  isSplashVisible: jest.fn().mockReturnValue(true),
}));

describe('useSplashControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SplashController.hideSplash as jest.Mock).mockResolvedValue(undefined);
    (SplashController.isSplashVisible as jest.Mock).mockReturnValue(true);
  });

  describe('Success Cases', () => {
    it('hideSplash calls controller correctly', async () => {
      const { result } = renderHook(() => useSplashControl());

      await act(async () => {
        await result.current.hideSplash();
      });

      expect(SplashController.hideSplash).toHaveBeenCalledWith(undefined);
    });

    it('hideSplash accepts custom options', async () => {
      const { result } = renderHook(() => useSplashControl());
      const options = { fade: false, duration: 500 };

      await act(async () => {
        await result.current.hideSplash(options);
      });

      expect(SplashController.hideSplash).toHaveBeenCalledWith(options);
    });

    it('isSplashVisible returns correct state', () => {
      (SplashController.isSplashVisible as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useSplashControl());

      const isVisible = result.current.isSplashVisible();

      expect(isVisible).toBe(true);
      expect(SplashController.isSplashVisible).toHaveBeenCalled();
    });
  });

  describe('Failure Cases', () => {
    it('handles hideSplash errors gracefully', async () => {
      (SplashController.hideSplash as jest.Mock).mockRejectedValue(new Error('Hide failed'));
      const { result } = renderHook(() => useSplashControl());

      await expect(
        act(async () => {
          await result.current.hideSplash();
        })
      ).rejects.toThrow('Hide failed');
    });

    it('isSplashVisible returns false when controller fails', () => {
      (SplashController.isSplashVisible as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useSplashControl());

      const isVisible = result.current.isSplashVisible();

      expect(isVisible).toBe(false);
    });
  });

  describe('Semantic Tests', () => {
    it('maintains stable function references', () => {
      const { result, rerender: rerenderHook } = renderHook(() => useSplashControl());
      const firstHide = result.current.hideSplash;
      const firstIsVisible = result.current.isSplashVisible;

      rerenderHook({});

      expect(result.current.hideSplash).toBe(firstHide);
      expect(result.current.isSplashVisible).toBe(firstIsVisible);
    });

    it('hideSplash function is async', () => {
      const { result } = renderHook(() => useSplashControl());
      const hideResult = result.current.hideSplash();

      expect(hideResult).toBeInstanceOf(Promise);
      
      return hideResult;
    });

    it('isSplashVisible function is synchronous', () => {
      const { result } = renderHook(() => useSplashControl());
      const visibleResult = result.current.isSplashVisible();

      expect(typeof visibleResult).toBe('boolean');
      expect(visibleResult).not.toBeInstanceOf(Promise);
    });
  });
});
