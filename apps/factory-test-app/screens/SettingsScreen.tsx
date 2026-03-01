import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SettingsScreen({ isDarkMode, textColor, secondaryText }: any) {
  return (
    <View style={styles.container}>
      <Text style={{ color: textColor }}>Settings Screen</Text>
      <Text style={{ color: secondaryText }}>This is a placeholder screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
