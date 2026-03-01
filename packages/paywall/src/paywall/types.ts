import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

export enum PaywallResult {
  PURCHASED = 'PURCHASED',
  RESTORED = 'RESTORED',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
}

export interface PaywallOptions {
  /**
   * Offering to display in paywall
   * If not provided, uses current offering
   */
  offering?: string;

  /**
   * Display mode for the paywall
   */
  displayMode?: 'fullScreen' | 'sheet';
}

export interface PaywallCallbacks {
  /**
   * Called when user completes a purchase
   */
  onPurchaseCompleted?: (customerInfo: CustomerInfo) => void;

  /**
   * Called when user starts a purchase
   */
  onPurchaseStarted?: (pkg: PurchasesPackage) => void;

  /**
   * Called when purchase fails
   */
  onPurchaseError?: (error: Error) => void;

  /**
   * Called when user cancels purchase
   */
  onPurchaseCancelled?: () => void;

  /**
   * Called when user completes restore
   */
  onRestoreCompleted?: (customerInfo: CustomerInfo) => void;

  /**
   * Called when restore fails
   */
  onRestoreError?: (error: Error) => void;

  /**
   * Called when user dismisses paywall
   */
  onDismiss?: () => void;
}
