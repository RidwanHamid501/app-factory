import { Logger } from '../utils/logger';
import type { DeepLink } from './types';

export function parseDeepLink(url: string): DeepLink | null {
  try {
    const urlObj = new URL(url);
    const queryParams: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    return {
      url,
      scheme: urlObj.protocol.replace(':', ''),
      hostname: urlObj.hostname || null,
      path: urlObj.pathname,
      queryParams,
    };
  } catch (error) {
    Logger.error('[Deep Link] Failed to parse:', url, error);
    return null;
  }
}

export function isValidAppURL(url: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => url.startsWith(prefix));
}
