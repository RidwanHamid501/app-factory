import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getAuth0Config } from '../config';
import { Logger } from '../../utils/logger';
import type { Credentials } from '../signin';

WebBrowser.maybeCompleteAuthSession();

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
}

export interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

export const useAuthRequest = () => {
  // Get config (may be null if not initialized)
  let config = null;
  try {
    config = getAuth0Config();
  } catch {
    Logger.warn('[Auth0Service] Auth0 not initialized yet');
  }

  // Always call hooks with fallback values (required by React rules)
  const domain = config?.domain || 'placeholder.auth0.com';
  const discovery = AuthSession.useAutoDiscovery(`https://${domain}`);
  
  const redirectUri = config ? AuthSession.makeRedirectUri({
    scheme: config.scheme,
    path: 'auth',
  }) : AuthSession.makeRedirectUri({
    scheme: 'factorytest', // Use the actual app scheme as fallback
    path: 'auth',
  });

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    config ? {
      clientId: config.clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      redirectUri,
      extraParams: {
        ...(config.audience && { audience: config.audience }),
        prompt: 'login',
      },
    } : {
      // Minimal valid config for placeholder when not initialized
      clientId: 'placeholder',
      scopes: ['openid'],
      redirectUri,
    },
    // Pass discovery only if config is valid
    config ? discovery : null,
  );

  return {
    request: config ? request : null, // Only return request if properly initialized
    result,
    promptAsync,
    redirectUri,
    isReady: !!request && !!discovery && !!config,
  };
};

export const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<Credentials> => {
  Logger.debug('[Auth0Service] Exchanging code for tokens');

  try {
    const config = getAuth0Config();
    const tokenEndpoint = `https://${config.domain}/oauth/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Logger.error('[Auth0Service] Token exchange failed:', errorData);
      throw new Error(errorData.error_description || 'Token exchange failed');
    }

    const data: TokenResponse = await response.json();

    Logger.info('[Auth0Service] Token exchange successful');

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } catch (error) {
    Logger.error('[Auth0Service] Token exchange failed', error);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<Credentials> => {
  Logger.debug('[Auth0Service] Refreshing access token');

  try {
    const config = getAuth0Config();
    const tokenEndpoint = `https://${config.domain}/oauth/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: config.clientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      Logger.error('[Auth0Service] Token refresh failed:', errorData);
      throw new Error(errorData.error_description || 'Token refresh failed');
    }

    const data: TokenResponse = await response.json();

    Logger.info('[Auth0Service] Token refresh successful');

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      idToken: data.id_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } catch (error) {
    Logger.error('[Auth0Service] Token refresh failed', error);
    throw error;
  }
};

export const getUserInfo = async (accessToken: string): Promise<UserInfo> => {
  Logger.debug('[Auth0Service] Fetching user info');

  try {
    const config = getAuth0Config();
    const userInfoEndpoint = `https://${config.domain}/userinfo`;

    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      Logger.error('[Auth0Service] User info fetch failed:', errorData);
      throw new Error('Failed to fetch user info');
    }

    const userInfo: UserInfo = await response.json();

    Logger.info('[Auth0Service] User info fetched successfully');

    return userInfo;
  } catch (error) {
    Logger.error('[Auth0Service] User info fetch failed', error);
    throw error;
  }
};
