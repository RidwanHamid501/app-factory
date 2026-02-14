import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from './settingsStore';
import { Settings } from './types';

export function useSettings(): Settings {
  return useSettingsStore(
    useShallow((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updateSettings, resetSettings, ...settings } = state;
      return settings as Settings;
    })
  );
}

export function useSettingsActions() {
  return useSettingsStore(
    useShallow((state) => ({
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  );
}

export function useLanguage() {
  return useSettingsStore((state) => state.language);
}

export function useCurrency() {
  return useSettingsStore((state) => state.currency);
}

export function useUnitSystem() {
  return useSettingsStore((state) => state.unitSystem);
}

export function useNotificationSettings() {
  return useSettingsStore((state) => state.notifications);
}
