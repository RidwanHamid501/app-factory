import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  initializeAuth0,
  useSignIn,
  signOut,
} from '@factory/auth-lite';
import { useIsDarkMode } from '@factory/app-shell';

export const SocialSignIn: React.FC = () => {
  const isDarkMode = useIsDarkMode();
  const [initialized, setInitialized] = useState(false);
  const { signIn, isLoading, isReady, error, credentials } = useSignIn();

  const handleInitialize = () => {
    try {
      initializeAuth0({
        domain: 'dev-pg5yk4yan4et555s.us.auth0.com',
        clientId: 'NBNgnJLOvtOqsmj8LgAvlUbXkGbJKwuP',
        scheme: 'factorytest',
      });
      setInitialized(true);
      Alert.alert('Success', 'Auth0 initialized successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message || 'Sign-in failed');
    }
  }, [error]);

  useEffect(() => {
    if (credentials) {
      Alert.alert('Success', 'Signed in successfully');
    }
  }, [credentials]);

  const handleSignIn = async (connection: string) => {
    if (!initialized) {
      Alert.alert('Error', 'Initialize Auth0 first');
      return;
    }

    if (!isReady) {
      Alert.alert('Error', 'Auth0 not ready yet');
      return;
    }

    await signIn(connection);
  };

  const handleSignOut = async () => {
    if (!credentials) {
      Alert.alert('Error', 'Not signed in');
      return;
    }

    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign-out failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
        Social Sign-In Integration Test
      </Text>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Current State
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Initialized: {initialized ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Ready: {isReady ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Signed In: {credentials ? 'Yes' : 'No'}
        </Text>
        {credentials && (
          <>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Access Token: {credentials.accessToken?.substring(0, 20)}...
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Has Refresh Token: {credentials.refreshToken ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Expires: {credentials.expiresAt.toLocaleString()}
            </Text>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Setup
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: initialized ? '#666' : '#007AFF' }]}
          onPress={handleInitialize}
          disabled={initialized}
        >
          <Text style={styles.buttonText}>
            {initialized ? 'Auth0 Initialized' : 'Initialize Auth0'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Sign In Methods
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4285F4' }]}
          onPress={() => handleSignIn('google-oauth2')}
          disabled={isLoading || !initialized || !isReady}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In with Google</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#000' }]}
          onPress={() => handleSignIn('apple')}
          disabled={isLoading || !initialized || !isReady}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In with Apple</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#1877F2' }]}
          onPress={() => handleSignIn('facebook')}
          disabled={isLoading || !initialized || !isReady}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In with Facebook</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Sign Out
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f44336' }]}
          onPress={handleSignOut}
          disabled={isLoading || !credentials}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Instructions
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          1. Auth0 domain and client ID are configured
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          2. Uses expo-auth-session with PKCE flow
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          3. No Android manifest config needed
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          4. Tap "Initialize Auth0" to begin
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          5. Test each sign-in method
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          6. Verify credentials are returned
        </Text>
        <Text style={[styles.instructionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          7. Test sign-out functionality
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
});
