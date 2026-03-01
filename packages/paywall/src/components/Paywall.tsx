import React from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import type { PurchasesPackage } from '../offerings/types';
import type { PaywallCallbacks } from '../paywall/types';

interface PaywallProps extends Omit<PaywallCallbacks, 'onPurchaseStarted'> {
  onPurchaseStarted?: (data: { packageBeingPurchased: PurchasesPackage }) => void;
}

/**
 * RevenueCat Paywall UI Component
 * Official docs: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
 * 
 * From docs: "Available listeners: onPurchaseStarted, onPurchaseCompleted, 
 * onPurchaseError, onPurchaseCancelled, onRestoreCompleted, onRestoreError, onDismiss"
 */
export function Paywall({
  onPurchaseStarted,
  onPurchaseCompleted,
  onPurchaseError,
  onPurchaseCancelled,
  onRestoreCompleted,
  onRestoreError,
  onDismiss,
}: PaywallProps) {
  return (
    <RevenueCatUI.Paywall
      onPurchaseStarted={onPurchaseStarted}
      onPurchaseCompleted={onPurchaseCompleted}
      onPurchaseError={onPurchaseError}
      onPurchaseCancelled={onPurchaseCancelled}
      onRestoreCompleted={onRestoreCompleted}
      onRestoreError={onRestoreError}
      onDismiss={onDismiss}
    />
  );
}
