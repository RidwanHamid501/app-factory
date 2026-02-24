import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { LoadingOverlayProps } from './types';

// Loading overlay component - Official docs: https://reactnative.dev/docs/activityindicator
export function LoadingOverlay({
  visible,
  message,
  transparent = false,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      testID="loading-overlay-container"
      style={[
        styles.container,
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator testID="activity-indicator" size="large" color="#fff" />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

// Styles using StyleSheet API - Official docs: https://reactnative.dev/docs/stylesheet
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  transparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
