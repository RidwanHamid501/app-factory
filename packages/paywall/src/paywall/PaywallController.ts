import RevenueCatUI from 'react-native-purchases-ui';
import { PaywallResult, type PaywallOptions } from './types';

export class PaywallController {
  /**
   * Present paywall if user doesn't have specified entitlement
   * Official docs: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
   * 
   * From docs: "Displays a paywall only if the customer lacks an unlocked entitlement"
   */
  async presentPaywallIfNeeded(
    entitlementId: string,
    _options?: PaywallOptions
  ): Promise<PaywallResult> {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: entitlementId,
      });

      return this.mapPaywallResult(result);
    } catch (error) {
      console.error('[PaywallController] Error presenting conditional paywall:', error);
      return PaywallResult.ERROR;
    }
  }

  /**
   * Present paywall unconditionally
   * Official docs: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
   */
  async presentPaywall(_options?: PaywallOptions): Promise<PaywallResult> {
    try {
      const result = await RevenueCatUI.presentPaywall({});

      return this.mapPaywallResult(result);
    } catch (error) {
      console.error('[PaywallController] Error presenting paywall:', error);
      return PaywallResult.ERROR;
    }
  }

  /**
   * Map RevenueCat result to our enum
   */
  private mapPaywallResult(result: unknown): PaywallResult {
    // Official result types from RevenueCat
    switch (result) {
      case RevenueCatUI.PAYWALL_RESULT.PURCHASED:
        return PaywallResult.PURCHASED;
      case RevenueCatUI.PAYWALL_RESULT.RESTORED:
        return PaywallResult.RESTORED;
      case RevenueCatUI.PAYWALL_RESULT.CANCELLED:
        return PaywallResult.CANCELLED;
      default:
        return PaywallResult.ERROR;
    }
  }
}

// Singleton instance
export const paywallController = new PaywallController();
