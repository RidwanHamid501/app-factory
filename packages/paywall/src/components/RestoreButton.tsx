import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, type ViewStyle } from 'react-native';
import { useRestorePurchases } from '../hooks/useRestorePurchases';

interface RestoreButtonProps {
  onSuccess?: () => void;
  onNoPurchases?: () => void;
  onError?: (error: Error) => void;
  title?: string;
  style?: ViewStyle;
}

/**
 * Restore Purchases button component
 * Required by Apple App Store Review Guideline 3.1.1
 */
export function RestoreButton({
  onSuccess,
  onNoPurchases,
  onError,
  title = 'Restore Purchases',
  style,
}: RestoreButtonProps) {
  const { restore, isRestoring, isSuccess, noPurchases } = useRestorePurchases();

  const handleRestore = async () => {
    try {
      await restore();

      if (isSuccess) {
        Alert.alert(
          'Success',
          'Your purchases have been restored!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else if (noPurchases) {
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases associated with your account.",
          [{ text: 'OK', onPress: onNoPurchases }]
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Restore failed');
      Alert.alert(
        'Restore Failed',
        error.message || 'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
      onError?.(error);
    }
  };

  return (
    <Pressable
      onPress={handleRestore}
      disabled={isRestoring}
      style={style}
    >
      {isRestoring ? (
        <ActivityIndicator />
      ) : (
        <Text>{title}</Text>
      )}
    </Pressable>
  );
}
