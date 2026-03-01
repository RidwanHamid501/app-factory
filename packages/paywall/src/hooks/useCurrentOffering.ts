import { useEffect, useState } from 'react';
import type { PurchasesOffering } from '../offerings/types';
import { offeringsManager } from '../offerings/OfferingsManager';

export function useCurrentOffering() {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCurrentOffering() {
      try {
        setIsLoading(true);
        setError(null);

        const result = await offeringsManager.getCurrentOffering();

        if (mounted) {
          setOffering(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch current offering'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCurrentOffering();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    offering,
    packages: offering?.availablePackages || [],
    monthlyPackage: offering?.monthly || null,
    annualPackage: offering?.annual || null,
    lifetimePackage: offering?.lifetime || null,
    isLoading,
    error,
  };
}
