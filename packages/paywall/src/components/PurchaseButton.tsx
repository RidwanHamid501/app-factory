import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, type ViewStyle } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { usePurchase } from '../hooks/usePurchase';
import { getUserFriendlyErrorMessage } from '../purchase/errorHandling';

interface PurchaseButtonProps {
  package: PurchasesPackage;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  title?: string;
  style?: ViewStyle;
}

export function PurchaseButton({
  package: pkg,
  onSuccess,
  onError,
  title = 'Subscribe',
  style,
}: PurchaseButtonProps) {
  const { purchase, isPurchasing } = usePurchase();

  const handlePurchase = async () => {
    try {
      await purchase(pkg);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Purchase failed');
      const errorMessage = getUserFriendlyErrorMessage(error);
      
      Alert.alert('Purchase Failed', errorMessage);
      onError?.(error);
    }
  };

  return (
    <Pressable
      onPress={handlePurchase}
      disabled={isPurchasing}
      style={style}
    >
      {isPurchasing ? (
        <ActivityIndicator />
      ) : (
        <Text>{title}</Text>
      )}
    </Pressable>
  );
}
