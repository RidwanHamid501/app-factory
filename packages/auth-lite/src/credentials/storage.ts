import * as SecureStore from 'expo-secure-store';
import { Logger } from '../utils/logger';

const CREDENTIALS_KEY = 'factory_auth_lite_credentials';

export interface Credentials {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: Date;
}

export async function saveCredentials(credentials: Credentials): Promise<void> {
  try {
    Logger.info('[Credentials] Saving credentials securely');
    
    const credentialsData = JSON.stringify({
      ...credentials,
      expiresAt: credentials.expiresAt.toISOString(),
    });
    
    await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsData);
    Logger.info('[Credentials] Credentials saved successfully');
  } catch (error) {
    Logger.error('[Credentials] Failed to save credentials:', error);
    throw error;
  }
}

export async function clearCredentials(): Promise<void> {
  try {
    Logger.info('[Credentials] Clearing credentials');
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    Logger.info('[Credentials] Credentials cleared successfully');
  } catch (error) {
    Logger.error('[Credentials] Failed to clear credentials:', error);
    throw error;
  }
}

