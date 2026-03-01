import { getUserInfo } from '../auth/services/auth0Service';
import { getAccessToken } from '../credentials/retrieval';
import { Logger } from '../utils/logger';

export interface UserProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const accessToken = await getAccessToken();
    
    Logger.debug('[Profile] Fetching user profile');
    
    const userInfo = await getUserInfo(accessToken);
    
    Logger.debug('[Profile] User profile retrieved', { 
      sub: userInfo.sub?.substring(0, 8) || 'unknown'
    });
    
    return userInfo as UserProfile;
  } catch (error) {
    Logger.error('[Profile] Failed to get user profile:', error);
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  try {
    const profile = await getUserProfile();
    return profile?.sub || null;
  } catch (error) {
    Logger.error('[Profile] Failed to get user ID:', error);
    return null;
  }
}

export async function getUserEmail(): Promise<string | null> {
  try {
    const profile = await getUserProfile();
    return profile?.email || null;
  } catch (error) {
    Logger.error('[Profile] Failed to get user email:', error);
    return null;
  }
}
