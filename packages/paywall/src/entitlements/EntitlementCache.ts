import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomerInfo } from './types';

const CACHE_KEY = '@paywall/customer-info';

// Cache CustomerInfo locally for offline entitlement checks
export async function cacheCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(customerInfo));
  } catch (error) {
    console.warn('[EntitlementCache] Failed to cache customer info:', error);
  }
}

// Get cached CustomerInfo for offline use
export async function getCachedCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('[EntitlementCache] Failed to get cached customer info:', error);
    return null;
  }
}

// Clear cached CustomerInfo
export async function clearCustomerInfoCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('[EntitlementCache] Failed to clear customer info cache:', error);
  }
}
