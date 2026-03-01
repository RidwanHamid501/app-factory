import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useIsDarkMode } from '@factory/app-shell';
import { Paywall } from '../../features/paywall';

export function PaywallScreen() {
  const isDarkMode = useIsDarkMode();

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Paywall
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
