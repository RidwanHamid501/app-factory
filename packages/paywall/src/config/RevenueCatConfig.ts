import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { PlatformConfig } from './types';

let isConfigured = false;

// Initialize RevenueCat SDK once per app lifecycle
export async function initializeRevenueCat(
  config: PlatformConfig,
  appUserID?: string
): Promise<void> {
  if (isConfigured) {
    console.warn('[RevenueCat] Already initialized');
    return;
  }

  // Enable debug logs in development
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  // Configure with platform-specific API key
  const apiKey = Platform.OS === 'ios' ? config.iosApiKey : config.androidApiKey;
  
  await Purchases.configure({
    apiKey,
    appUserID, // Optional: custom user ID or RevenueCat generates anonymous ID
  });

  isConfigured = true;
}

export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}
