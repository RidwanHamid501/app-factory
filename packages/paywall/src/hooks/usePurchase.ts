import { useState, useCallback } from 'react';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { purchaseManager } from '../purchase/PurchaseManager';
import { PurchaseState, type PurchaseError } from '../purchase/types';

export function usePurchase() {
  const [state, setState] = useState<PurchaseState>(PurchaseState.IDLE);
  const [error, setError] = useState<PurchaseError | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    try {
      setState(PurchaseState.PURCHASING);
      setError(null);

      const result = await purchaseManager.purchasePackage(pkg);

      setState(PurchaseState.SUCCESS);
      setCustomerInfo(result.customerInfo);

      return result;
    } catch (err) {
      const purchaseError = err as PurchaseError;

      if (purchaseError.userCancelled) {
        setState(PurchaseState.CANCELLED);
      } else {
        setState(PurchaseState.ERROR);
        setError(purchaseError);
      }

      throw purchaseError;
    }
  }, []);

  const reset = useCallback(() => {
    setState(PurchaseState.IDLE);
    setError(null);
    setCustomerInfo(null);
  }, []);

  return {
    purchase,
    reset,
    state,
    isPurchasing: state === PurchaseState.PURCHASING,
    isSuccess: state === PurchaseState.SUCCESS,
    isError: state === PurchaseState.ERROR,
    isCancelled: state === PurchaseState.CANCELLED,
    error,
    customerInfo,
  };
}
