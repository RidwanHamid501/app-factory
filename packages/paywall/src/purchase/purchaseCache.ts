import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PurchasesPackage } from 'react-native-purchases';

const PURCHASE_ATTEMPT_KEY = '@paywall/purchase-attempt';

interface PurchaseAttempt {
  packageIdentifier: string;
  timestamp: number;
}

/**
 * Cache last purchase attempt for retry on network failure
 */
export async function cachePurchaseAttempt(pkg: PurchasesPackage): Promise<void> {
  try {
    const attempt: PurchaseAttempt = {
      packageIdentifier: pkg.identifier,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(PURCHASE_ATTEMPT_KEY, JSON.stringify(attempt));
  } catch (error) {
    console.warn('[PurchaseCache] Failed to cache purchase attempt:', error);
  }
}

/**
 * Get last purchase attempt
 */
export async function getLastPurchaseAttempt(): Promise<PurchaseAttempt | null> {
  try {
    const cached = await AsyncStorage.getItem(PURCHASE_ATTEMPT_KEY);
    if (!cached) return null;

    const attempt = JSON.parse(cached) as PurchaseAttempt;
    
    // Only return if attempt is less than 5 minutes old
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - attempt.timestamp < fiveMinutes) {
      return attempt;
    }

    return null;
  } catch (error) {
    console.warn('[PurchaseCache] Failed to get purchase attempt:', error);
    return null;
  }
}

/**
 * Clear purchase attempt cache
 */
export async function clearPurchaseAttempt(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PURCHASE_ATTEMPT_KEY);
  } catch (error) {
    console.warn('[PurchaseCache] Failed to clear purchase attempt:', error);
  }
}
