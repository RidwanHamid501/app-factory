import { Logger } from '../utils/logger';

export interface Auth0Config {
  domain: string;
  clientId: string;
  scheme?: string;
  audience?: string;
}

let config: Auth0Config | null = null;

export function initializeAuth0(authConfig: Auth0Config): void {
  if (!authConfig.domain || !authConfig.clientId) {
    throw new Error('[Auth0] domain and clientId are required');
  }

  if (config) {
    Logger.debug('[Auth0] Client already initialized');
    return;
  }

  Logger.debug('[Auth0] Initializing with domain:', authConfig.domain);
  
  config = {
    ...authConfig,
    scheme: authConfig.scheme || 'myapp',
    audience: authConfig.audience,
  };

  Logger.info('[Auth0] Client initialized successfully');
}

export function getAuth0Config(): Auth0Config {
  if (!config) {
    throw new Error('[Auth0] Client not initialized. Call initializeAuth0() first.');
  }
  return config;
}
