import * as SecureStore from 'expo-secure-store';
import { Logger } from '../utils/logger';
import { refreshAccessToken } from '../auth/services/auth0Service';

const CREDENTIALS_KEY = 'factory_auth_lite_credentials';

export interface Credentials {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: Date;
}

export interface GetCredentialsOptions {
  minTtl?: number;
  forceRefresh?: boolean;
}

async function loadStoredCredentials(): Promise<Credentials | null> {
  try {
    const credentialsData = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!credentialsData) {
      return null;
    }

    const parsed = JSON.parse(credentialsData);
    return {
      ...parsed,
      expiresAt: new Date(parsed.expiresAt),
    };
  } catch (error) {
    Logger.error('[Credentials] Failed to load stored credentials:', error);
    return null;
  }
}

async function saveCredentials(credentials: Credentials): Promise<void> {
  const credentialsData = JSON.stringify({
    ...credentials,
    expiresAt: credentials.expiresAt.toISOString(),
  });
  await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsData);
}

function isTokenExpired(expiresAt: Date, minTtl: number = 0): boolean {
  const now = Date.now();
  const expiryTime = expiresAt.getTime();
  const ttl = expiryTime - now;
  return ttl <= minTtl * 1000;
}

export async function getCredentials(options?: GetCredentialsOptions): Promise<Credentials> {
  try {
    const logMsg = options?.forceRefresh 
      ? '[Credentials] Force refreshing credentials'
      : '[Credentials] Getting credentials (auto-refresh if needed)';
    Logger.info(logMsg);
    
    const stored = await loadStoredCredentials();
    
    if (!stored) {
      throw new Error('No credentials found');
    }

    const needsRefresh = options?.forceRefresh || isTokenExpired(stored.expiresAt, options?.minTtl);
    
    if (needsRefresh && stored.refreshToken) {
      Logger.info('[Credentials] Refreshing expired token');
      const refreshed = await refreshAccessToken(stored.refreshToken);
      await saveCredentials(refreshed);
      Logger.info('[Credentials] Credentials refreshed successfully');
      return refreshed;
    }
    
    Logger.info('[Credentials] Credentials retrieved successfully');
    return stored;
  } catch (error) {
    Logger.error('[Credentials] Failed to get credentials:', error);
    throw error;
  }
}

export async function getAccessToken(minTtl?: number): Promise<string> {
  const credentials = await getCredentials({ minTtl });
  return credentials.accessToken;
}

export async function refreshCredentials(): Promise<Credentials> {
  return getCredentials({ forceRefresh: true });
}

