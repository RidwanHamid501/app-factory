import type { 
  CustomerInfo,
  PurchasesEntitlementInfos,
  PurchasesEntitlementInfo 
} from 'react-native-purchases';

// Re-export official SDK types
export type { 
  CustomerInfo,
  PurchasesEntitlementInfos,
  PurchasesEntitlementInfo 
};

export interface EntitlementCheckResult {
  hasEntitlement: boolean;
  entitlementInfo: PurchasesEntitlementInfo | null;
}

export interface CustomerInfoState {
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: number;
}
