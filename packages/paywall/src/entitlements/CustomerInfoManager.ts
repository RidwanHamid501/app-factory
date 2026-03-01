import Purchases from 'react-native-purchases';
import type { CustomerInfo, PurchasesEntitlementInfo } from './types';

export class CustomerInfoManager {
  private cachedCustomerInfo: CustomerInfo | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get customer info (subscription status, entitlements, etc.) - SDK caches automatically
  async getCustomerInfo(forceRefresh: boolean = false): Promise<CustomerInfo> {
    const now = Date.now();
    const cacheExpired = now - this.lastFetchTime > this.CACHE_DURATION;

    if (this.cachedCustomerInfo && !cacheExpired && !forceRefresh) {
      return this.cachedCustomerInfo;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    
    this.cachedCustomerInfo = customerInfo;
    this.lastFetchTime = now;

    return customerInfo;
  }

  // Check if user has specific entitlement (check entitlements.active[id])
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[entitlementId];
    return entitlement?.isActive === true;
  }

  // Get specific entitlement info
  async getEntitlement(entitlementId: string): Promise<PurchasesEntitlementInfo | null> {
    const customerInfo = await this.getCustomerInfo();
    return customerInfo.entitlements.active[entitlementId] || null;
  }

  // Check if user has any active entitlements
  async hasAnyActiveEntitlement(): Promise<boolean> {
    const customerInfo = await this.getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  }

  // Clear cached customer info (call after purchases, restores, or sign-in)
  clearCache(): void {
    this.cachedCustomerInfo = null;
    this.lastFetchTime = 0;
  }

  // Get cached customer info without network request
  getCachedCustomerInfo(): CustomerInfo | null {
    const now = Date.now();
    const cacheExpired = now - this.lastFetchTime > this.CACHE_DURATION;

    if (this.cachedCustomerInfo && !cacheExpired) {
      return this.cachedCustomerInfo;
    }

    return null;
  }
}

// Singleton instance
export const customerInfoManager = new CustomerInfoManager();
