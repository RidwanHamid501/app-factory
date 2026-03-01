import type { PlatformConfig } from './types';

interface GlobalWithProcess {
  process?: {
    env?: Record<string, string | undefined>;
  };
}

// Load RevenueCat config from environment variables (Expo: EXPO_PUBLIC_ prefix)
export function getRevenueCatConfig(): PlatformConfig {
  const globalObj = global as GlobalWithProcess;
  const iosApiKey = globalObj.process?.env?.EXPO_PUBLIC_REVENUECAT_IOS || '';
  const androidApiKey = globalObj.process?.env?.EXPO_PUBLIC_REVENUECAT_ANDROID || '';

  if (!iosApiKey || !androidApiKey) {
    throw new Error(
      '[RevenueCat] Missing API keys. Set EXPO_PUBLIC_REVENUECAT_IOS and EXPO_PUBLIC_REVENUECAT_ANDROID in .env'
    );
  }

  return {
    iosApiKey,
    androidApiKey,
  };
}
