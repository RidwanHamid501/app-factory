import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTypedRoute, goBack } from '@factory/app-shell';
import type { RootStackParamList } from '../App';

interface ScreenProps {
  isDarkMode: boolean;
  textColor: string;
  secondaryText: string;
}

// Home Screen - shown as the main content
export function HomeScreen() {
  return null; // Home content is the main app content
}

// Profile Screen
export function ProfileScreen({ isDarkMode, textColor, secondaryText }: ScreenProps) {
  const route = useTypedRoute<RootStackParamList, 'Profile'>();
  const { userId } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]}>
        <Text style={[styles.title, { color: textColor }]}>Profile Screen</Text>
        <Text style={[styles.label, { color: secondaryText }]}>User ID:</Text>
        <Text style={[styles.value, { color: textColor }]}>{userId}</Text>
        <Text style={[styles.description, { color: secondaryText, marginTop: 16 }]}>
          This screen demonstrates type-safe route parameters.
          The userId prop is automatically typed.
        </Text>
        
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? '#555' : '#888' }]}
          onPress={() => goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Settings Screen  
export function SettingsScreen({ isDarkMode, textColor, secondaryText }: ScreenProps) {
  const route = useTypedRoute<RootStackParamList, 'Settings'>();
  const { tab } = route.params || {};

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]}>
        <Text style={[styles.title, { color: textColor }]}>Settings Screen</Text>
        {tab && (
          <>
            <Text style={[styles.label, { color: secondaryText }]}>Tab:</Text>
            <Text style={[styles.value, { color: textColor }]}>{tab}</Text>
          </>
        )}
        <Text style={[styles.description, { color: secondaryText, marginTop: 16 }]}>
          This screen demonstrates optional route parameters.
          The tab parameter is optional and type-safe.
        </Text>
        
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? '#555' : '#888' }]}
          onPress={() => goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Details Screen
export function DetailsScreen({ isDarkMode, textColor, secondaryText }: ScreenProps) {
  const route = useTypedRoute<RootStackParamList, 'Details'>();
  const { id } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff' }]}>
        <Text style={[styles.title, { color: textColor }]}>Details Screen</Text>
        <Text style={[styles.label, { color: secondaryText }]}>ID:</Text>
        <Text style={[styles.value, { color: textColor }]}>{id}</Text>
        <Text style={[styles.description, { color: secondaryText, marginTop: 16 }]}>
          This screen can be reached via navigation or deep linking.
          Try: factorytest://details/456
        </Text>
        
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? '#555' : '#888' }]}
          onPress={() => goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
