import React, { type ReactNode, useState } from 'react';
import { Modal } from 'react-native';
import { useEntitlement } from '../hooks/useEntitlement';
import { Paywall } from './Paywall';

interface PaywallGateProps {
  entitlementId: string;
  children: ReactNode;
  onAccessGranted?: () => void;
}

/**
 * Feature gate that shows paywall modal when user lacks entitlement
 */
export function PaywallGate({
  entitlementId,
  children,
  onAccessGranted,
}: PaywallGateProps) {
  const { hasEntitlement, isLoading } = useEntitlement(entitlementId);
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!hasEntitlement) {
    return (
      <>
        <Modal
          visible={showPaywall}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPaywall(false)}
        >
          <Paywall
            onPurchaseCompleted={() => {
              setShowPaywall(false);
              onAccessGranted?.();
            }}
            onDismiss={() => setShowPaywall(false)}
          />
        </Modal>
        
        {React.cloneElement(children as React.ReactElement, {
          onPress: () => setShowPaywall(true),
        })}
      </>
    );
  }

  return <>{children}</>;
}
