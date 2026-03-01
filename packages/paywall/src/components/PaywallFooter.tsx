import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';

interface PaywallFooterProps {
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  onRestorePress?: () => void;
}

/**
 * Paywall footer with legal links and restore button
 * Required for App Store compliance
 */
export function PaywallFooter({
  termsOfServiceUrl,
  privacyPolicyUrl,
  onRestorePress,
}: PaywallFooterProps) {
  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.container}>
      {onRestorePress && (
        <Pressable onPress={onRestorePress} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>
      )}

      <View style={styles.linksContainer}>
        {termsOfServiceUrl && (
          <Pressable onPress={() => openUrl(termsOfServiceUrl)}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </Pressable>
        )}

        {termsOfServiceUrl && privacyPolicyUrl && (
          <Text style={styles.separator}> • </Text>
        )}

        {privacyPolicyUrl && (
          <Pressable onPress={() => openUrl(privacyPolicyUrl)}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 14,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#666',
    fontSize: 12,
  },
  separator: {
    color: '#666',
    fontSize: 12,
  },
});
