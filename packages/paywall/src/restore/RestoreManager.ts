import Purchases from 'react-native-purchases';
import type { CustomerInfo } from 'react-native-purchases';
import type { RestoreResult, RestoreError } from './types';
import { customerInfoManager } from '../entitlements/CustomerInfoManager';

export class RestoreManager {
  /**
   * Restore purchases from App Store / Play Store
   * Official docs: https://www.revenuecat.com/docs/getting-started/restoring-purchases
   * 
   * From docs: "Reactivates previously purchased content. 
   * May trigger OS-level sign-in prompts."
   */
  async restorePurchases(): Promise<RestoreResult> {
    try {
      // Official restore method
      const customerInfo: CustomerInfo = await Purchases.restorePurchases();

      // Clear cache to force refresh with restored purchases
      customerInfoManager.clearCache();

      // Check if any entitlements were restored
      const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;

      return {
        customerInfo,
        entitlementsRestored: hasActiveEntitlements,
      };
    } catch (error) {
      throw this.handleRestoreError(error);
    }
  }

  /**
   * Sync purchases programmatically (no OS prompts)
   * Official docs: https://www.revenuecat.com/docs/getting-started/restoring-purchases
   * 
   * From docs: "Used for programmatic restoration without user interaction 
   * and without OS prompts. Respects logged-in user's ID."
   */
  async syncPurchases(): Promise<CustomerInfo> {
    try {
      // Sync purchases for current logged-in user
      await Purchases.syncPurchases();

      // Get updated customer info
      const customerInfo = await Purchases.getCustomerInfo();

      // Clear cache
      customerInfoManager.clearCache();

      return customerInfo;
    } catch (error) {
      throw this.handleRestoreError(error);
    }
  }

  /**
   * Handle restore errors
   */
  private handleRestoreError(error: unknown): RestoreError {
    const err = error as Record<string, unknown>;
    const restoreError: RestoreError = {
      message: (err.message as string) || 'Failed to restore purchases',
      code: err.code as string,
    };

    if (__DEV__) {
      console.error('[RestoreManager] Restore error:', restoreError);
    }

    return restoreError;
  }
}

// Singleton instance
export const restoreManager = new RestoreManager();
