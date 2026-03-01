import Purchases from 'react-native-purchases';
import type { PurchasesOfferings, PurchasesOffering } from './types';

export class OfferingsManager {
  private cachedOfferings: PurchasesOfferings | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Fetch offerings from RevenueCat with 5-minute caching
  async getOfferings(forceRefresh: boolean = false): Promise<PurchasesOfferings> {
    const now = Date.now();
    const cacheExpired = now - this.lastFetchTime > this.CACHE_DURATION;

    if (this.cachedOfferings && !cacheExpired && !forceRefresh) {
      return this.cachedOfferings;
    }

    const offerings = await Purchases.getOfferings();
    
    this.cachedOfferings = offerings;
    this.lastFetchTime = now;

    return offerings;
  }

  // Get current offering (default offering from dashboard)
  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    const offerings = await this.getOfferings();
    return offerings.current;
  }

  // Get specific offering by identifier
  async getOffering(identifier: string): Promise<PurchasesOffering | null> {
    const offerings = await this.getOfferings();
    return offerings.all[identifier] || null;
  }

  // Clear cached offerings
  clearCache(): void {
    this.cachedOfferings = null;
    this.lastFetchTime = 0;
  }
}

// Singleton instance
export const offeringsManager = new OfferingsManager();
