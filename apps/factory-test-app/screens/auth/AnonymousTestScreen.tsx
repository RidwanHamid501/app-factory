import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsDarkMode } from '@factory/app-shell';
import { Anonymous } from '../../features/auth';

export function AnonymousTestScreen() {
  const isDarkMode = useIsDarkMode();
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Anonymous />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
