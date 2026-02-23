import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import type { ErrorFallbackProps } from './types';

// Default error fallback UI - Official docs: https://github.com/bvaughn/react-error-boundary#fallbackcomponent-prop
export function ErrorFallback({ error, resetErrorBoundary, isDevelopment, isDarkMode }: ErrorFallbackProps) {
  const colorScheme = useColorScheme();
  const isDark = isDarkMode ?? (colorScheme === 'dark');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={[styles.content, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={[styles.message, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {isDevelopment && (
          <ScrollView style={[styles.errorDetails, { 
            backgroundColor: isDark ? '#3f1f1f' : '#fef2f2',
            borderColor: isDark ? '#7f1d1d' : '#fecaca'
          }]}>
            <Text style={[styles.errorTitle, { color: isDark ? '#fca5a5' : '#991b1b' }]}>Error Details (Dev Only):</Text>
            <Text style={[styles.errorText, { color: isDark ? '#fca5a5' : '#7f1d1d' }]}>{error.message}</Text>
            {error.stack && (
              <>
                <Text style={[styles.stackTitle, { color: isDark ? '#fca5a5' : '#991b1b' }]}>Stack Trace:</Text>
                <Text style={[styles.stackText, { color: isDark ? '#fca5a5' : '#7f1d1d' }]}>{error.stack}</Text>
              </>
            )}
          </ScrollView>
        )}

        <Pressable 
          style={[styles.button, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]} 
          onPress={resetErrorBoundary} 
          testID="error-fallback-reset"
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 500,
    width: '100%',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    maxHeight: 300,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stackText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
