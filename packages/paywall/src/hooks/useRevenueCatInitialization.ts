import { useEffect, useState } from 'react';
import { initializeRevenueCat } from '../config/RevenueCatConfig';

export function useRevenueCatInitialization(apiKey: string, appUserID?: string) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (!apiKey) {
          throw new Error('RevenueCat API key is required');
        }

        const config = {
          iosApiKey: apiKey,
          androidApiKey: apiKey,
        };
        
        await initializeRevenueCat(config, appUserID);
        
        if (mounted) {
          setIsInitialized(true);
          if (__DEV__) {
            console.error('[RevenueCat] SDK initialized successfully');
          }
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
          setError(errorMessage);
          if (__DEV__) {
            console.error('[RevenueCat] Initialization error:', errorMessage);
          }
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [apiKey, appUserID]);

  return { isInitialized, error };
}
