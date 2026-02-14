export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'ko';

export type UnitSystem = 'metric' | 'imperial';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'BRL';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

export interface Settings {
  language: Language;
  currency: Currency;
  unitSystem: UnitSystem;
  notifications: NotificationSettings;
  reducedMotion: boolean;
  highContrast: boolean;
  autoPlayVideos: boolean;
  dataUsageMode: 'normal' | 'reduced';
}
