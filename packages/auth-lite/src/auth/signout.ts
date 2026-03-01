import * as WebBrowser from 'expo-web-browser';
import { getAuth0Config } from './config';
import { clearCredentials } from '../credentials/storage';
import { Logger } from '../utils/logger';

export async function signOut(): Promise<void> {
  try {
    Logger.info('[Auth0] Starting sign-out');
    
    const config = getAuth0Config();
    const logoutUrl = `https://${config.domain}/v2/logout`;
    
    await WebBrowser.openAuthSessionAsync(logoutUrl, '');
    await clearCredentials();
    
    Logger.info('[Auth0] Sign-out successful and credentials cleared');
  } catch (error) {
    Logger.error('[Auth0] Sign-out failed:', error);
    throw error;
  }
}

