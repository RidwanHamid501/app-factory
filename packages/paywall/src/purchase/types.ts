import type { CustomerInfo } from 'react-native-purchases';

export interface PurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
}

export interface PurchaseError {
  message: string;
  userCancelled: boolean;
  code?: string;
}

export enum PurchaseState {
  IDLE = 'IDLE',
  PURCHASING = 'PURCHASING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseStatus {
  state: PurchaseState;
  error: PurchaseError | null;
  customerInfo: CustomerInfo | null;
}
