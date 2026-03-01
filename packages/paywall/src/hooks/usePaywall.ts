import { useCallback } from 'react';
import { paywallController } from '../paywall/PaywallController';
import type { PaywallOptions, PaywallResult } from '../paywall/types';

export function usePaywall() {
  /**
   * Present paywall if user lacks entitlement
   */
  const presentIfNeeded = useCallback(
    async (entitlementId: string, options?: PaywallOptions): Promise<PaywallResult> => {
      return paywallController.presentPaywallIfNeeded(entitlementId, options);
    },
    []
  );

  /**
   * Present paywall unconditionally
   */
  const present = useCallback(
    async (options?: PaywallOptions): Promise<PaywallResult> => {
      return paywallController.presentPaywall(options);
    },
    []
  );

  return {
    presentIfNeeded,
    present,
  };
}
