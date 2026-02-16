import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { 
  useTypedNavigation, 
  useTypedRoute, 
  navigate,
  goBack,
  getCurrentRouteName,
} from '@factory/app-shell';
import type { RootStackParamList } from '../../App';

interface NavigationProps {
  onEvent: (event: string) => void;
  deepLinkEvents: string[];
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function Navigation({ 
  onEvent,
  deepLinkEvents,
  isDarkMode, 
  cardBackground, 
  textColor, 
  secondaryText 
}: NavigationProps) {
  const navigation = useTypedNavigation<RootStackParamList>();
  const route = useTypedRoute<RootStackParamList, 'Home' | 'Profile' | 'Settings' | 'Details'>();
  const currentRoute = getCurrentRouteName();

  // Navigation action handlers
  const handleNavigateProfile = () => {
    onEvent('Navigate: Profile (userId: 123)');
    navigation.navigate('Profile', { userId: '123' });
  };

  const handleNavigateSettings = () => {
    onEvent('Navigate: Settings (tab: notifications)');
    navigation.navigate('Settings', { tab: 'notifications' });
  };

  const handleNavigateDetails = () => {
    onEvent('Navigate: Details (id: 456)');
    navigation.navigate('Details', { id: '456' });
  };

  const handleGoBack = () => {
    onEvent('Navigate: Go Back');
    goBack();
  };

  const handleImperativeNav = () => {
    onEvent('Imperative Navigate: Profile (userId: 999)');
    navigate<RootStackParamList>('Profile', { userId: '999' });
  };

  // Test deep link handlers
  const handleTestDeepLink = (url: string) => {
    onEvent(`Testing Deep Link: ${url}`);
    Linking.openURL(url).catch(err => {
      onEvent(`Error opening URL: ${err.message}`);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: cardBackground }]}>
      <Text style={[styles.title, { color: textColor }]}>Navigation Testing</Text>

      {/* Current Route Info */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: secondaryText }]}>Current Route:</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {currentRoute || 'Unknown'}
        </Text>
        
        <Text style={[styles.label, { color: secondaryText, marginTop: 8 }]}>Route Name (Hook):</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {route.name}
        </Text>

        {route.params && Object.keys(route.params).length > 0 && (
          <>
            <Text style={[styles.label, { color: secondaryText, marginTop: 8 }]}>Route Params:</Text>
            <Text style={[styles.value, { color: textColor, fontFamily: 'monospace', fontSize: 11 }]}>
              {JSON.stringify(route.params, null, 2)}
            </Text>
          </>
        )}

        {deepLinkEvents.length > 0 && (
          <>
            <Text style={[styles.label, { color: secondaryText, marginTop: 8 }]}>Recent Deep Links:</Text>
            {deepLinkEvents.slice(0, 3).map((link, idx) => (
              <Text key={idx} style={[styles.value, { color: textColor, fontSize: 10 }]} numberOfLines={1}>
                {link}
              </Text>
            ))}
          </>
        )}
      </View>

      {/* Basic Navigation */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Basic Navigation</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF' }]}
            onPress={handleNavigateProfile}
          >
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF' }]}
            onPress={handleNavigateSettings}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isDarkMode ? '#0A84FF' : '#007AFF' }]}
            onPress={handleNavigateDetails}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.fullButton, { backgroundColor: isDarkMode ? '#555' : '#888' }]}
          onPress={handleGoBack}
        >
          <Text style={styles.buttonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* Imperative Navigation */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Imperative Navigation</Text>
        <Text style={[styles.description, { color: secondaryText }]}>
          Navigate from outside React components (e.g., push notifications)
        </Text>
        <TouchableOpacity 
          style={[styles.button, styles.fullButton, { backgroundColor: isDarkMode ? '#FF6B35' : '#FF5722' }]}
          onPress={handleImperativeNav}
        >
          <Text style={styles.buttonText}>Navigate Imperatively</Text>
        </TouchableOpacity>
      </View>

      {/* Deep Link Testing */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Deep Link Testing</Text>
        <Text style={[styles.description, { color: secondaryText }]}>
          Tap to test deep links (custom scheme)
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
            onPress={() => handleTestDeepLink('factorytest://home')}
          >
            <Text style={[styles.linkText, { color: textColor }]}>factorytest://home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
            onPress={() => handleTestDeepLink('factorytest://profile/123')}
          >
            <Text style={[styles.linkText, { color: textColor }]}>factorytest://profile/123</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
            onPress={() => handleTestDeepLink('factorytest://settings?tab=notifications')}
          >
            <Text style={[styles.linkText, { color: textColor }]}>
              factorytest://settings?tab=...
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={[styles.note, { color: secondaryText }]}>
          Note: Deep links can also be tested via terminal using adb (Android) or xcrun simctl (iOS)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  fullButton: {
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    marginBottom: 8,
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  linkText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  note: {
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
