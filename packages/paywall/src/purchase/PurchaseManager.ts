import Purchases from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';
import type { PurchaseResult, PurchaseError } from './types';
import { customerInfoManager } from '../entitlements/CustomerInfoManager';

export class PurchaseManager {
  // Purchase a package - RevenueCat handles transaction finishing automatically
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    try {
      const result = await Purchases.purchasePackage(pkg);
      customerInfoManager.clearCache();

      return {
        customerInfo: result.customerInfo,
        productIdentifier: result.productIdentifier,
      };
    } catch (error) {
      throw this.handlePurchaseError(error);
    }
  }

  private handlePurchaseError(error: unknown): PurchaseError {
    const err = error as Record<string, unknown>;
    const purchaseError: PurchaseError = {
      message: (err.message as string) || 'Purchase failed',
      userCancelled: err.userCancelled === true,
      code: err.code as string,
    };

    if (__DEV__) {
      console.error('[PurchaseManager] Purchase error:', purchaseError);
    }

    return purchaseError;
  }

  isUserCancellation(error: PurchaseError): boolean {
    return error.userCancelled === true;
  }

  isNetworkError(error: PurchaseError): boolean {
    return error.code === 'NETWORK_ERROR' || error.message.includes('network');
  }
}

// Singleton instance
export const purchaseManager = new PurchaseManager();
