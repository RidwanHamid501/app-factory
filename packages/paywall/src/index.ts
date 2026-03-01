// Configuration
export { initializeRevenueCat, isRevenueCatConfigured } from './config/RevenueCatConfig';
export { getRevenueCatConfig } from './config/environment';
export type { RevenueCatConfig, PlatformConfig } from './config/types';

// Offerings
export { offeringsManager, OfferingsManager } from './offerings/OfferingsManager';
export * from './offerings/packageUtils';
export type {
  PurchasesOfferings,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct,
  OfferingsFetchResult,
} from './offerings/types';

// Entitlements
export { customerInfoManager, CustomerInfoManager } from './entitlements/CustomerInfoManager';
export * from './entitlements/subscriptionUtils';
export * from './entitlements/EntitlementCache';
export type {
  CustomerInfo,
  PurchasesEntitlementInfos,
  PurchasesEntitlementInfo,
  EntitlementCheckResult,
  CustomerInfoState,
} from './entitlements/types';

// Purchase
export { purchaseManager, PurchaseManager } from './purchase/PurchaseManager';
export * from './purchase/errorHandling';
export * from './purchase/purchaseCache';
export { PurchaseState } from './purchase/types';
export type {
  PurchaseResult,
  PurchaseError,
  PurchaseStatus,
} from './purchase/types';

// Restore
export { restoreManager, RestoreManager } from './restore/RestoreManager';
export * from './restore/errorHandling';
export * from './restore/autoRestore';
export { RestoreState } from './restore/types';
export type {
  RestoreResult,
  RestoreError,
  RestoreStatus,
} from './restore/types';

// Paywall
export { paywallController, PaywallController } from './paywall/PaywallController';
export { PaywallResult } from './paywall/types';
export type {
  PaywallOptions,
  PaywallCallbacks,
} from './paywall/types';

// Hooks
export { useRevenueCatInitialization } from './hooks/useRevenueCatInitialization';
export { useOfferings } from './hooks/useOfferings';
export { useCurrentOffering } from './hooks/useCurrentOffering';
export { useCustomerInfo } from './hooks/useCustomerInfo';
export { useEntitlement } from './hooks/useEntitlement';
export { usePurchase } from './hooks/usePurchase';
export { useRestorePurchases } from './hooks/useRestorePurchases';
export { usePaywall } from './hooks/usePaywall';

// Components
export { SubscriptionGate } from './components/SubscriptionGate';
export { PurchaseButton } from './components/PurchaseButton';
export { RestoreButton } from './components/RestoreButton';
export { Paywall } from './components/Paywall';
export { PaywallFooter } from './components/PaywallFooter';
export { PaywallGate } from './components/PaywallGate';
