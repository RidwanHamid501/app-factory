import { create } from 'zustand';
import { Settings, NotificationSettings } from './types';
import { Logger } from '../../utils/logger';

type SettingsUpdate = Partial<Omit<Settings, 'notifications'>> & {
  notifications?: Partial<NotificationSettings>;
};

interface SettingsStore extends Settings {
  updateSettings: (partial: SettingsUpdate) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  language: 'en',
  currency: 'USD',
  unitSystem: 'metric',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
  },
  reducedMotion: false,
  highContrast: false,
  autoPlayVideos: true,
  dataUsageMode: 'normal',
};

export const useSettingsStore = create<SettingsStore>()((set) => ({
  ...defaultSettings,
  
  updateSettings: (partial: SettingsUpdate) => {
    Logger.info('Updating settings', partial);
    set((state) => ({
      ...state,
      ...partial,
      notifications: partial.notifications
        ? { ...state.notifications, ...partial.notifications }
        : state.notifications,
    }));
  },
  
  resetSettings: () => {
    Logger.info('Resetting settings to defaults');
    set(defaultSettings);
  },
}));
