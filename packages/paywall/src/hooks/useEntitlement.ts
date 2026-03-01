import { useEffect, useState } from 'react';
import type { PurchasesEntitlementInfo } from '../entitlements/types';
import { customerInfoManager } from '../entitlements/CustomerInfoManager';

export function useEntitlement(entitlementId: string) {
  const [hasEntitlement, setHasEntitlement] = useState(false);
  const [entitlementInfo, setEntitlementInfo] = useState<PurchasesEntitlementInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkEntitlement() {
      try {
        setIsLoading(true);
        setError(null);

        const hasAccess = await customerInfoManager.hasEntitlement(entitlementId);
        const info = await customerInfoManager.getEntitlement(entitlementId);

        if (mounted) {
          setHasEntitlement(hasAccess);
          setEntitlementInfo(info);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to check entitlement'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkEntitlement();

    return () => {
      mounted = false;
    };
  }, [entitlementId]);

  return {
    hasEntitlement,
    entitlementInfo,
    isActive: entitlementInfo?.isActive || false,
    expirationDate: entitlementInfo?.expirationDate || null,
    isLoading,
    error,
  };
}
