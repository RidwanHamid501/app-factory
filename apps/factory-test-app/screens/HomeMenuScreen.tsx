import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useIsDarkMode } from '@factory/app-shell';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TestStackParamList } from '../App';

export function HomeMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TestStackParamList>>();
  const isDarkMode = useIsDarkMode();

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  const menuItems = [
    {
      title: '@factory/app-shell Tests',
      items: [
        { name: 'Lifecycle & Events', screen: 'Lifecycle' as const, description: 'App state and lifecycle events' },
        { name: 'Navigation & Deep Links', screen: 'Navigation' as const, description: 'Navigation and deep linking' },
        { name: 'Theme & Stores', screen: 'Stores' as const, description: 'Theme switching and store management' },
        { name: 'Loading & Tasks', screen: 'LoadingTest' as const, description: 'Loading states and async tasks' },
        { name: 'Error Handling', screen: 'ErrorTest' as const, description: 'Error boundaries and Sentry' },
        { name: 'Remote Config', screen: 'RemoteConfigTest' as const, description: 'Firebase Remote Config' },
      ],
    },
    {
      title: '@factory/auth-lite Tests',
      items: [
        { name: 'Anonymous Mode', screen: 'AnonymousTest' as const, description: 'Anonymous ID generation and storage' },
        { name: 'Social Sign-In', screen: 'SocialSignIn' as const, description: 'OAuth with Google, Apple, Facebook' },
        { name: 'Token Management', screen: 'TokenManagement' as const, description: 'Credentials storage and refresh' },
        { name: 'Account Migration', screen: 'AccountMigration' as const, description: 'Guest to authenticated migration' },
        { name: 'Account Management', screen: 'AccountManagement' as const, description: 'User profile and info' },
        { name: 'Account Deletion', screen: 'AccountDeletion' as const, description: 'Account deletion with re-auth' },
      ],
    },
    {
      title: '@factory/paywall Tests',
      items: [
        { name: 'Paywall Overview', screen: 'Paywall' as const, description: 'Basic paywall functionality' },
        { name: 'Integration Tests', screen: 'PaywallTest' as const, description: 'Full integration test suite' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: textColor }]}>
          Factory Test App
        </Text>
        <Text style={[styles.subtitle, { color: secondaryText }]}>
          Select a feature to test
        </Text>

        {menuItems.map((section, index) => (
          <View key={index} style={[styles.section, { backgroundColor: cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#3a3a3a' : '#e5e5e5' }]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: textColor }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.menuItemDescription, { color: secondaryText }]}>
                    {item.description}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: secondaryText }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>
            📚 Documentation
          </Text>
          <Text style={[styles.infoText, { color: secondaryText }]}>
            • App Shell: integration_tests/app-shell.md{'\n'}
            • Auth Lite: integration_tests/auth-lite.md{'\n'}
            • Paywall: integration_tests/paywall.md
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
