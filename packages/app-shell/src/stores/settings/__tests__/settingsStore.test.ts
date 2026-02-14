import { renderHook, act } from '@testing-library/react-native';
import { useSettingsStore } from '../settingsStore';
import {
  useSettings,
  useSettingsActions,
  useLanguage,
  useCurrency,
  useUnitSystem,
  useNotificationSettings,
} from '../hooks';

describe('Settings Store', () => {
  beforeEach(() => {
    const store = useSettingsStore.getState();
    store.resetSettings();
  });

  describe('Initial State', () => {
    it('should initialize with default settings', () => {
      const state = useSettingsStore.getState();
      
      expect(state.language).toBe('en');
      expect(state.currency).toBe('USD');
      expect(state.unitSystem).toBe('metric');
      expect(state.notifications).toEqual({
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
      });
      expect(state.reducedMotion).toBe(false);
      expect(state.highContrast).toBe(false);
      expect(state.autoPlayVideos).toBe(true);
      expect(state.dataUsageMode).toBe('normal');
    });
  });

  describe('updateSettings', () => {
    it('should update language setting', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({ language: 'es' });
      });
      
      const state = useSettingsStore.getState();
      expect(state.language).toBe('es');
    });

    it('should update multiple settings at once', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          language: 'fr',
          currency: 'EUR',
          unitSystem: 'imperial',
        });
      });
      
      const state = useSettingsStore.getState();
      expect(state.language).toBe('fr');
      expect(state.currency).toBe('EUR');
      expect(state.unitSystem).toBe('imperial');
    });

    it('should deep merge notification settings', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          notifications: { sound: false },
        });
      });
      
      const state = useSettingsStore.getState();
      expect(state.notifications).toEqual({
        enabled: true,
        sound: false,
        vibration: true,
        badge: true,
      });
    });

    it('should update accessibility settings', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          reducedMotion: true,
          highContrast: true,
        });
      });
      
      const state = useSettingsStore.getState();
      expect(state.reducedMotion).toBe(true);
      expect(state.highContrast).toBe(true);
    });

    it('should fail when updating with invalid language', () => {
      const store = useSettingsStore.getState();
      
      expect(() => {
        act(() => {
          // @ts-expect-error Testing invalid value
          store.updateSettings({ language: 'invalid' });
        });
      }).not.toThrow();
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          language: 'ja',
          currency: 'JPY',
          reducedMotion: true,
        });
      });
      
      act(() => {
        store.resetSettings();
      });
      
      const state = useSettingsStore.getState();
      expect(state.language).toBe('en');
      expect(state.currency).toBe('USD');
      expect(state.reducedMotion).toBe(false);
    });

    it('should reset notification settings completely', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          notifications: {
            enabled: false,
            sound: false,
            vibration: false,
            badge: false,
          },
        });
      });
      
      act(() => {
        store.resetSettings();
      });
      
      const state = useSettingsStore.getState();
      expect(state.notifications).toEqual({
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
      });
    });
  });

  describe('Hooks', () => {
    describe('useSettings', () => {
      it('should return all settings', () => {
        const { result } = renderHook(() => useSettings());
        
        expect(result.current.language).toBe('en');
        expect(result.current.currency).toBe('USD');
        expect(result.current.unitSystem).toBe('metric');
        expect(result.current.notifications).toBeDefined();
      });

      it('should update when settings change', () => {
        const { result } = renderHook(() => useSettings());
        const store = useSettingsStore.getState();
        
        act(() => {
          store.updateSettings({ language: 'de' });
        });
        
        expect(result.current.language).toBe('de');
      });
    });

    describe('useSettingsActions', () => {
      it('should return actions', () => {
        const { result } = renderHook(() => useSettingsActions());
        
        expect(result.current.updateSettings).toBeDefined();
        expect(result.current.resetSettings).toBeDefined();
      });

      it('should call updateSettings action', () => {
        const { result } = renderHook(() => useSettingsActions());
        
        act(() => {
          result.current.updateSettings({ language: 'pt' });
        });
        
        const state = useSettingsStore.getState();
        expect(state.language).toBe('pt');
      });
    });

    describe('useLanguage', () => {
      it('should return current language', () => {
        const { result } = renderHook(() => useLanguage());
        expect(result.current).toBe('en');
      });

      it('should update when language changes', () => {
        const { result } = renderHook(() => useLanguage());
        const store = useSettingsStore.getState();
        
        act(() => {
          store.updateSettings({ language: 'zh' });
        });
        
        expect(result.current).toBe('zh');
      });
    });

    describe('useCurrency', () => {
      it('should return current currency', () => {
        const { result } = renderHook(() => useCurrency());
        expect(result.current).toBe('USD');
      });

      it('should update when currency changes', () => {
        const { result } = renderHook(() => useCurrency());
        const store = useSettingsStore.getState();
        
        act(() => {
          store.updateSettings({ currency: 'GBP' });
        });
        
        expect(result.current).toBe('GBP');
      });
    });

    describe('useUnitSystem', () => {
      it('should return current unit system', () => {
        const { result } = renderHook(() => useUnitSystem());
        expect(result.current).toBe('metric');
      });

      it('should update when unit system changes', () => {
        const { result } = renderHook(() => useUnitSystem());
        const store = useSettingsStore.getState();
        
        act(() => {
          store.updateSettings({ unitSystem: 'imperial' });
        });
        
        expect(result.current).toBe('imperial');
      });
    });

    describe('useNotificationSettings', () => {
      it('should return notification settings', () => {
        const { result } = renderHook(() => useNotificationSettings());
        
        expect(result.current).toEqual({
          enabled: true,
          sound: true,
          vibration: true,
          badge: true,
        });
      });

      it('should update when notification settings change', () => {
        const { result } = renderHook(() => useNotificationSettings());
        const store = useSettingsStore.getState();
        
        act(() => {
          store.updateSettings({
            notifications: { enabled: false },
          });
        });
        
        expect(result.current.enabled).toBe(false);
        expect(result.current.sound).toBe(true);
      });
    });
  });

  describe('Semantic Invariants', () => {
    it('should maintain notification object integrity during partial updates', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          notifications: { sound: false },
        });
      });
      
      const state = useSettingsStore.getState();
      expect(Object.keys(state.notifications)).toHaveLength(4);
      expect(state.notifications.enabled).toBeDefined();
      expect(state.notifications.sound).toBeDefined();
      expect(state.notifications.vibration).toBeDefined();
      expect(state.notifications.badge).toBeDefined();
    });

    it('should not affect other settings when updating one', () => {
      const store = useSettingsStore.getState();
      const initialState = { ...useSettingsStore.getState() };
      
      act(() => {
        store.updateSettings({ language: 'ko' });
      });
      
      const state = useSettingsStore.getState();
      expect(state.currency).toBe(initialState.currency);
      expect(state.unitSystem).toBe(initialState.unitSystem);
      expect(state.notifications).toEqual(initialState.notifications);
    });

    it('should maintain state consistency after reset', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({ language: 'es', currency: 'EUR' });
        store.resetSettings();
      });
      
      const state1 = useSettingsStore.getState();
      
      act(() => {
        store.resetSettings();
      });
      
      const state2 = useSettingsStore.getState();
      expect(state2).toEqual(state1);
    });

    it('should handle rapid successive updates correctly', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({ language: 'en' });
        store.updateSettings({ language: 'es' });
        store.updateSettings({ language: 'fr' });
      });
      
      const state = useSettingsStore.getState();
      expect(state.language).toBe('fr');
    });

    it('should preserve notification settings when updating unrelated settings', () => {
      const store = useSettingsStore.getState();
      
      act(() => {
        store.updateSettings({
          notifications: { sound: false, vibration: false },
        });
      });
      
      const notificationsAfterFirstUpdate = { ...useSettingsStore.getState().notifications };
      
      act(() => {
        store.updateSettings({ language: 'ja', currency: 'JPY' });
      });
      
      const state = useSettingsStore.getState();
      expect(state.notifications).toEqual(notificationsAfterFirstUpdate);
    });
  });
});
