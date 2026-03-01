import { useEffect, useState } from 'react';
import { useAuthRequest, exchangeCodeForTokens } from './services/auth0Service';
import { saveCredentials } from '../credentials/storage';
import { checkAndMigrate } from '../linking/migration';
import { Logger } from '../utils/logger';

export interface Credentials {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: Date;
}

export interface UseSignInReturn {
  signIn: (connection?: string, options?: { maxAge?: number }) => Promise<void>;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  credentials: Credentials | null;
}

export function useSignIn(): UseSignInReturn {
  const authRequest = useAuthRequest();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  
  // Safely extract properties with defaults for uninitialized state
  const { request, result, promptAsync, redirectUri, isReady = false } = authRequest || {};

  useEffect(() => {
    if (result?.type === 'success' && result.params.code && request?.codeVerifier) {
      const handleSuccess = async () => {
        try {
          setIsLoading(true);
          Logger.info('[Auth0] Authorization successful, exchanging code for tokens');
          
          const creds = await exchangeCodeForTokens(
            result.params.code,
            request.codeVerifier || '',
            redirectUri || '',
          );
          
          await saveCredentials(creds);
          await checkAndMigrate();
          
          setCredentials(creds);
          Logger.info('[Auth0] Sign-in successful and credentials saved');
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          Logger.error('[Auth0] Token exchange failed:', error);
        } finally {
          setIsLoading(false);
        }
      };

      handleSuccess();
    } else if (result?.type === 'error') {
      const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error
        ? String(result.error.message)
        : 'Authorization failed';
      const error = new Error(errorMessage);
      setError(error);
      Logger.error('[Auth0] Authorization error:', error);
    } else if (result?.type === 'dismiss' || result?.type === 'cancel') {
      Logger.info('[Auth0] Sign-in cancelled by user');
    }
  }, [result, request, redirectUri]);

  const signIn = async (connection?: string, _options?: { maxAge?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      setCredentials(null);
      
      Logger.info('[Auth0] Starting sign-in', connection ? `with ${connection}` : 'universal');
      
      // Note: max_age must be set in useAuthRequest config, not in promptAsync
      // For now, we'll pass connection_scope if provided
      await promptAsync?.({} as never);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      Logger.error('[Auth0] Failed to start sign-in:', error);
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    isReady,
    error,
    credentials,
  };
}

export function useSignInWithGoogle() {
  const signIn = useSignIn();
  
  return {
    ...signIn,
    signInWithGoogle: () => signIn.signIn('google-oauth2'),
  };
}

export function useSignInWithApple() {
  const signIn = useSignIn();
  
  return {
    ...signIn,
    signInWithApple: () => signIn.signIn('apple'),
  };
}

export function useSignInWithFacebook() {
  const signIn = useSignIn();
  
  return {
    ...signIn,
    signInWithFacebook: () => signIn.signIn('facebook'),
  };
}
