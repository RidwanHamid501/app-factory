import { renderHook, act } from '@testing-library/react-native';
import { useTelemetryStore } from '../telemetryStore';
import { telemetryManager } from '../telemetryManager';
import {
  useTrackEvent,
  useTrackScreen,
  useIdentifyUser,
  useResetUser,
  useTelemetry,
  useTelemetryEnabled,
} from '../hooks';
import { Logger } from '../../../utils/logger';

jest.mock('../../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
  },
}));

describe('Telemetry Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const store = useTelemetryStore.getState();
    store.setEnabled(true);
  });

  describe('TelemetryManager', () => {
    it('should track events when enabled', () => {
      telemetryManager.setEnabled(true);
      telemetryManager.track('test_event', { key: 'value' });
      
      expect(Logger.info).toHaveBeenCalledWith(
        '[Analytics] Track: test_event',
        { key: 'value' }
      );
    });

    it('should not track events when disabled', () => {
      telemetryManager.setEnabled(false);
      telemetryManager.track('test_event', { key: 'value' });
      
      const calls = (Logger.info as jest.Mock).mock.calls;
      const trackCalls = calls.filter(call => call[0].includes('Track:'));
      expect(trackCalls.length).toBe(0);
    });

    it('should track screen views when enabled', () => {
      telemetryManager.setEnabled(true);
      telemetryManager.screen('HomeScreen', { from: 'login' });
      
      expect(Logger.info).toHaveBeenCalledWith(
        '[Analytics] Screen: HomeScreen',
        { from: 'login' }
      );
    });

    it('should not track screen views when disabled', () => {
      telemetryManager.setEnabled(false);
      telemetryManager.screen('HomeScreen');
      
      const calls = (Logger.info as jest.Mock).mock.calls;
      const screenCalls = calls.filter(call => call[0].includes('Screen:'));
      expect(screenCalls.length).toBe(0);
    });

    it('should identify user when enabled', () => {
      telemetryManager.setEnabled(true);
      telemetryManager.identify('user123', { email: 'test@example.com' });
      
      expect(Logger.info).toHaveBeenCalledWith(
        '[Analytics] Identify: user123',
        { email: 'test@example.com' }
      );
    });

    it('should not identify user when disabled', () => {
      telemetryManager.setEnabled(false);
      telemetryManager.identify('user123');
      
      const calls = (Logger.info as jest.Mock).mock.calls;
      const identifyCalls = calls.filter(call => call[0].includes('Identify:'));
      expect(identifyCalls.length).toBe(0);
    });

    it('should reset user when enabled', () => {
      telemetryManager.setEnabled(true);
      telemetryManager.reset();
      
      expect(Logger.info).toHaveBeenCalledWith('[Analytics] Reset user');
    });

    it('should not reset user when disabled', () => {
      telemetryManager.setEnabled(false);
      telemetryManager.reset();
      
      const calls = (Logger.info as jest.Mock).mock.calls;
      const resetCalls = calls.filter(call => call[0].includes('Reset user'));
      expect(resetCalls.length).toBe(0);
    });

    it('should return enabled status', () => {
      telemetryManager.setEnabled(true);
      expect(telemetryManager.isEnabled()).toBe(true);
      
      telemetryManager.setEnabled(false);
      expect(telemetryManager.isEnabled()).toBe(false);
    });
  });

  describe('Telemetry Store', () => {
    it('should initialize with enabled state', () => {
      const state = useTelemetryStore.getState();
      expect(state.enabled).toBe(true);
    });

    it('should update enabled state', () => {
      const store = useTelemetryStore.getState();
      
      act(() => {
        store.setEnabled(false);
      });
      
      expect(useTelemetryStore.getState().enabled).toBe(false);
    });

    it('should sync with telemetry manager when enabled state changes', () => {
      const store = useTelemetryStore.getState();
      
      act(() => {
        store.setEnabled(false);
      });
      
      expect(telemetryManager.isEnabled()).toBe(false);
      
      act(() => {
        store.setEnabled(true);
      });
      
      expect(telemetryManager.isEnabled()).toBe(true);
    });
  });

  describe('Hooks', () => {
    describe('useTrackEvent', () => {
      it('should return track function', () => {
        const { result } = renderHook(() => useTrackEvent());
        expect(typeof result.current).toBe('function');
      });

      it('should track event when enabled', () => {
        const { result } = renderHook(() => useTrackEvent());
        
        act(() => {
          result.current('button_click', { button: 'submit' });
        });
        
        expect(Logger.info).toHaveBeenCalledWith(
          '[Analytics] Track: button_click',
          { button: 'submit' }
        );
      });

      it('should not track event when disabled', () => {
        const store = useTelemetryStore.getState();
        const { result } = renderHook(() => useTrackEvent());
        
        act(() => {
          store.setEnabled(false);
        });
        
        jest.clearAllMocks();
        
        act(() => {
          result.current('button_click', { button: 'submit' });
        });
        
        const calls = (Logger.info as jest.Mock).mock.calls;
        const trackCalls = calls.filter(call => call[0]?.includes('Track:'));
        expect(trackCalls.length).toBe(0);
      });

      it('should update when enabled state changes', () => {
        const store = useTelemetryStore.getState();
        const { result } = renderHook(() => useTrackEvent());
        
        act(() => {
          store.setEnabled(false);
        });
        
        jest.clearAllMocks();
        
        act(() => {
          result.current('event1');
        });
        
        expect(Logger.info).not.toHaveBeenCalledWith(
          expect.stringContaining('Track: event1'),
          expect.anything()
        );
        
        act(() => {
          store.setEnabled(true);
        });
        
        act(() => {
          result.current('event2');
        });
        
        expect(Logger.info).toHaveBeenCalledWith(
          '[Analytics] Track: event2',
          undefined
        );
      });
    });

    describe('useTrackScreen', () => {
      it('should return track screen function', () => {
        const { result } = renderHook(() => useTrackScreen());
        expect(typeof result.current).toBe('function');
      });

      it('should track screen when enabled', () => {
        const { result } = renderHook(() => useTrackScreen());
        
        act(() => {
          result.current('ProfileScreen', { userId: '123' });
        });
        
        expect(Logger.info).toHaveBeenCalledWith(
          '[Analytics] Screen: ProfileScreen',
          { userId: '123' }
        );
      });

      it('should not track screen when disabled', () => {
        const store = useTelemetryStore.getState();
        const { result } = renderHook(() => useTrackScreen());
        
        act(() => {
          store.setEnabled(false);
        });
        
        jest.clearAllMocks();
        
        act(() => {
          result.current('ProfileScreen');
        });
        
        const calls = (Logger.info as jest.Mock).mock.calls;
        const screenCalls = calls.filter(call => call[0]?.includes('Screen:'));
        expect(screenCalls.length).toBe(0);
      });
    });

    describe('useIdentifyUser', () => {
      it('should return identify function', () => {
        const { result } = renderHook(() => useIdentifyUser());
        expect(typeof result.current).toBe('function');
      });

      it('should identify user when enabled', () => {
        const { result } = renderHook(() => useIdentifyUser());
        
        act(() => {
          result.current('user456', { name: 'John Doe' });
        });
        
        expect(Logger.info).toHaveBeenCalledWith(
          '[Analytics] Identify: user456',
          { name: 'John Doe' }
        );
      });

      it('should not identify user when disabled', () => {
        const store = useTelemetryStore.getState();
        const { result } = renderHook(() => useIdentifyUser());
        
        act(() => {
          store.setEnabled(false);
        });
        
        jest.clearAllMocks();
        
        act(() => {
          result.current('user456');
        });
        
        const calls = (Logger.info as jest.Mock).mock.calls;
        const identifyCalls = calls.filter(call => call[0]?.includes('Identify:'));
        expect(identifyCalls.length).toBe(0);
      });
    });

    describe('useResetUser', () => {
      it('should return reset function', () => {
        const { result } = renderHook(() => useResetUser());
        expect(typeof result.current).toBe('function');
      });

      it('should reset user when enabled', () => {
        const { result } = renderHook(() => useResetUser());
        
        act(() => {
          result.current();
        });
        
        expect(Logger.info).toHaveBeenCalledWith('[Analytics] Reset user');
      });

      it('should not reset user when disabled', () => {
        const store = useTelemetryStore.getState();
        const { result } = renderHook(() => useResetUser());
        
        act(() => {
          store.setEnabled(false);
        });
        
        jest.clearAllMocks();
        
        act(() => {
          result.current();
        });
        
        const calls = (Logger.info as jest.Mock).mock.calls;
        const resetCalls = calls.filter(call => call[0]?.includes('Reset user'));
        expect(resetCalls.length).toBe(0);
      });
    });

    describe('useTelemetry', () => {
      it('should return telemetry state and actions', () => {
        const { result } = renderHook(() => useTelemetry());
        
        expect(result.current.enabled).toBe(true);
        expect(result.current.setEnabled).toBeDefined();
      });

      it('should update enabled state', () => {
        const { result } = renderHook(() => useTelemetry());
        
        act(() => {
          result.current.setEnabled(false);
        });
        
        expect(result.current.enabled).toBe(false);
      });
    });

    describe('useTelemetryEnabled', () => {
      it('should return enabled state', () => {
        const { result } = renderHook(() => useTelemetryEnabled());
        expect(result.current).toBe(true);
      });

      it('should update when enabled state changes', () => {
        const { result } = renderHook(() => useTelemetryEnabled());
        const store = useTelemetryStore.getState();
        
        act(() => {
          store.setEnabled(false);
        });
        
        expect(result.current).toBe(false);
      });
    });
  });

  describe('Semantic Invariants', () => {
    it('should maintain consistent state between store and manager', () => {
      const store = useTelemetryStore.getState();
      
      act(() => {
        store.setEnabled(false);
      });
      
      expect(useTelemetryStore.getState().enabled).toBe(false);
      expect(telemetryManager.isEnabled()).toBe(false);
      
      act(() => {
        store.setEnabled(true);
      });
      
      expect(useTelemetryStore.getState().enabled).toBe(true);
      expect(telemetryManager.isEnabled()).toBe(true);
    });

    it('should handle rapid toggling', () => {
      const store = useTelemetryStore.getState();
      
      act(() => {
        store.setEnabled(false);
        store.setEnabled(true);
        store.setEnabled(false);
        store.setEnabled(true);
      });
      
      expect(useTelemetryStore.getState().enabled).toBe(true);
      expect(telemetryManager.isEnabled()).toBe(true);
    });

    it('should respect enabled state for all tracking methods', () => {
      const store = useTelemetryStore.getState();
      
      act(() => {
        store.setEnabled(false);
      });
      
      jest.clearAllMocks();
      
      telemetryManager.track('event');
      telemetryManager.screen('screen');
      telemetryManager.identify('user');
      telemetryManager.reset();
      
      const calls = (Logger.info as jest.Mock).mock.calls;
      const analyticsCalls = calls.filter(call => call[0]?.includes('[Analytics]'));
      expect(analyticsCalls.length).toBe(0);
    });

    it('should allow tracking with undefined properties', () => {
      telemetryManager.track('event_no_props');
      
      expect(Logger.info).toHaveBeenCalledWith(
        '[Analytics] Track: event_no_props',
        undefined
      );
    });

    it('should handle complex property objects', () => {
      const complexProps = {
        nested: { deeply: { value: 123 } },
        array: [1, 2, 3],
        null: null,
        boolean: true,
      };
      
      telemetryManager.track('complex_event', complexProps);
      
      expect(Logger.info).toHaveBeenCalledWith(
        '[Analytics] Track: complex_event',
        complexProps
      );
    });
  });
});
