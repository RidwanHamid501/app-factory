import * as SecureStore from 'expo-secure-store';
import { Logger } from '../utils/logger';

const CREDENTIALS_KEY = 'factory_auth_lite_credentials';

export async function hasValidCredentials(minTtl?: number): Promise<boolean> {
  try {
    Logger.debug('[Credentials] Checking credential validity', minTtl ? `with minTtl: ${minTtl}s` : '');
    
    const credentialsData = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!credentialsData) {
      Logger.debug('[Credentials] No credentials found');
      return false;
    }

    const parsed = JSON.parse(credentialsData);
    const expiresAt = new Date(parsed.expiresAt);
    const now = Date.now();
    const expiryTime = expiresAt.getTime();
    const ttl = expiryTime - now;
    const minTtlMs = (minTtl || 0) * 1000;
    
    const isValid = ttl > minTtlMs;
    Logger.debug('[Credentials] Credentials valid:', isValid);
    return isValid;
  } catch (error) {
    Logger.error('[Credentials] Failed to check credentials:', error);
    return false;
  }
}
