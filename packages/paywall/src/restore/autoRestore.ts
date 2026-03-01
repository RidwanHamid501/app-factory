import { restoreManager } from './RestoreManager';

/**
 * Automatically sync purchases when user signs in
 * Use syncPurchases() to avoid OS prompts
 * 
 * Note: This should be called by auth integration, not in this package directly
 */
export async function syncPurchasesOnSignIn(): Promise<void> {
  try {
    await restoreManager.syncPurchases();
  } catch (error) {
    // Log error but don't throw - sign-in should succeed even if sync fails
    if (__DEV__) {
      console.warn('[AutoRestore] Failed to sync purchases on sign-in:', error);
    }
  }
}

/**
 * Automatically sync purchases when app becomes active
 * Useful for detecting external purchases (e.g., from App Store listing)
 */
export async function syncPurchasesOnAppActive(): Promise<void> {
  try {
    await restoreManager.syncPurchases();
  } catch (error) {
    // Silent fail - don't interrupt user
    if (__DEV__) {
      console.warn('[AutoRestore] Failed to sync purchases on app active:', error);
    }
  }
}
