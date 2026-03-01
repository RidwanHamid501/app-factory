import type { 
  PurchasesOfferings, 
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct 
} from 'react-native-purchases';

// Re-export types from SDK for convenience
export type { 
  PurchasesOfferings, 
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreProduct 
};

export interface OfferingsFetchResult {
  offerings: PurchasesOfferings | null;
  error: Error | null;
  isLoading: boolean;
}
