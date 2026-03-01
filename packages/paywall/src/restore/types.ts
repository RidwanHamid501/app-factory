import type { CustomerInfo } from 'react-native-purchases';

export interface RestoreResult {
  customerInfo: CustomerInfo;
  entitlementsRestored: boolean;
}

export interface RestoreError {
  message: string;
  code?: string;
}

export enum RestoreState {
  IDLE = 'IDLE',
  RESTORING = 'RESTORING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NO_PURCHASES = 'NO_PURCHASES',
}

export interface RestoreStatus {
  state: RestoreState;
  error: RestoreError | null;
  customerInfo: CustomerInfo | null;
}
