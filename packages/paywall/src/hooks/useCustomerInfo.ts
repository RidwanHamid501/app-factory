import { useEffect, useState, useCallback } from 'react';
import type { CustomerInfo } from '../entitlements/types';
import { customerInfoManager } from '../entitlements/CustomerInfoManager';

export function useCustomerInfo() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomerInfo = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const info = await customerInfoManager.getCustomerInfo(forceRefresh);
      setCustomerInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer info'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerInfo();
  }, [fetchCustomerInfo]);

  const refetch = () => fetchCustomerInfo(true);

  return {
    customerInfo,
    isLoading,
    error,
    refetch,
  };
}
