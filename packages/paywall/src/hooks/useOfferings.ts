import { useEffect, useState } from 'react';
import type { PurchasesOfferings } from '../offerings/types';
import { offeringsManager } from '../offerings/OfferingsManager';

export function useOfferings() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchOfferings() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await offeringsManager.getOfferings();

        if (mounted) {
          setOfferings(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch offerings'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchOfferings();

    return () => {
      mounted = false;
    };
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await offeringsManager.getOfferings(true);
      setOfferings(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch offerings'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    offerings,
    currentOffering: offerings?.current || null,
    isLoading,
    error,
    refetch,
  };
}
