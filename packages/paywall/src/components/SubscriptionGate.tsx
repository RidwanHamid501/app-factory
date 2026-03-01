import React, { type ReactNode } from 'react';
import { useEntitlement } from '../hooks/useEntitlement';

interface SubscriptionGateProps {
  entitlementId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Render children only if user has the specified entitlement
 * Official pattern: check entitlement before rendering premium content
 */
export function SubscriptionGate({
  entitlementId,
  children,
  fallback = null,
  loadingFallback = null,
}: SubscriptionGateProps) {
  const { hasEntitlement, isLoading } = useEntitlement(entitlementId);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!hasEntitlement) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
