import { useState, useCallback } from 'react';
import type { CustomerInfo } from 'react-native-purchases';
import { restoreManager } from '../restore/RestoreManager';
import { RestoreState, type RestoreError } from '../restore/types';

export function useRestorePurchases() {
  const [state, setState] = useState<RestoreState>(RestoreState.IDLE);
  const [error, setError] = useState<RestoreError | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const restore = useCallback(async () => {
    try {
      setState(RestoreState.RESTORING);
      setError(null);

      const result = await restoreManager.restorePurchases();

      if (result.entitlementsRestored) {
        setState(RestoreState.SUCCESS);
        setCustomerInfo(result.customerInfo);
      } else {
        setState(RestoreState.NO_PURCHASES);
        setCustomerInfo(result.customerInfo);
      }

      return result;
    } catch (err) {
      setState(RestoreState.ERROR);
      setError(err as RestoreError);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState(RestoreState.IDLE);
    setError(null);
    setCustomerInfo(null);
  }, []);

  return {
    restore,
    reset,
    state,
    isRestoring: state === RestoreState.RESTORING,
    isSuccess: state === RestoreState.SUCCESS,
    isError: state === RestoreState.ERROR,
    noPurchases: state === RestoreState.NO_PURCHASES,
    error,
    customerInfo,
  };
}
