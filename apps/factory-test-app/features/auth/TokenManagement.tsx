import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  initializeAuth0,
  useSignIn,
  signOut,
  hasValidCredentials,
  getCredentials,
  getAccessToken,
  refreshCredentials,
  clearCredentials,
} from '@factory/auth-lite';
import { useIsDarkMode } from '@factory/app-shell';

export const TokenManagement: React.FC = () => {
  const isDarkMode = useIsDarkMode();
  const { signIn, isLoading: signInLoading, isReady, credentials: signInCredentials } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [hasValidCreds, setHasValidCreds] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    accessToken: string;
    expiresAt: string;
    hasRefreshToken: boolean;
  } | null>(null);

  useEffect(() => {
    checkCredentials();
  }, []);

  useEffect(() => {
    if (signInCredentials) {
      setTokenInfo({
        accessToken: signInCredentials.accessToken.substring(0, 30),
        expiresAt: signInCredentials.expiresAt.toISOString(),
        hasRefreshToken: !!signInCredentials.refreshToken,
      });
      checkCredentials();
      Alert.alert('Success', 'Signed in and credentials saved');
      setLoading(false);
    }
  }, [signInCredentials]);

  const checkCredentials = async () => {
    const valid = await hasValidCredentials();
    setHasValidCreds(valid);
  };

  const handleInitialize = () => {
    try {
      initializeAuth0({
        domain: 'dev-pg5yk4yan4et555s.us.auth0.com',
        clientId: 'NBNgnJLOvtOqsmj8LgAvlUbXkGbJKwuP',
        scheme: 'factorytest',
      });
      setInitialized(true);
      Alert.alert('Success', 'Auth0 initialized');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignIn = async () => {
    if (!initialized) {
      Alert.alert('Error', 'Initialize Auth0 first');
      return;
    }

    if (!isReady) {
      Alert.alert('Error', 'Auth0 not ready yet');
      return;
    }

    setLoading(true);
    try {
      await signIn('google-oauth2');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign-in failed');
      setLoading(false);
    }
  };

  const handleGetCredentials = async () => {
    setLoading(true);
    try {
      const credentials = await getCredentials();
      setTokenInfo({
        accessToken: credentials.accessToken.substring(0, 30),
        expiresAt: credentials.expiresAt.toISOString(),
        hasRefreshToken: !!credentials.refreshToken,
      });
      Alert.alert('Success', 'Retrieved credentials (auto-refreshed if needed)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAccessToken = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      Alert.alert('Access Token', token.substring(0, 50) + '...');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get token');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const credentials = await refreshCredentials();
      setTokenInfo({
        accessToken: credentials.accessToken.substring(0, 30),
        expiresAt: credentials.expiresAt.toISOString(),
        hasRefreshToken: !!credentials.refreshToken,
      });
      Alert.alert('Success', 'Credentials force-refreshed');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCredentials = async () => {
    setLoading(true);
    try {
      await clearCredentials();
      setTokenInfo(null);
      await checkCredentials();
      Alert.alert('Success', 'Credentials cleared from storage');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Clear failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setTokenInfo(null);
      await checkCredentials();
      Alert.alert('Success', 'Signed out and credentials cleared');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Sign-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
        Token Management Integration Test
      </Text>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Current State
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Initialized: {initialized ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Has Valid Credentials: {hasValidCreds ? 'Yes' : 'No'}
        </Text>
        {tokenInfo && (
          <>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Access Token: {tokenInfo.accessToken}...
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Has Refresh Token: {tokenInfo.hasRefreshToken ? 'Yes' : 'No'}
            </Text>
            <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              Expires: {new Date(tokenInfo.expiresAt).toLocaleString()}
            </Text>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Setup</Text>
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
          Sign In & Storage
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4285F4' }]}
          onPress={handleSignIn}
          disabled={loading || signInLoading || !initialized}
        >
          {loading || signInLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In (saves credentials)</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Credential Operations
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3' }]}
          onPress={handleGetCredentials}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Credentials (auto-refresh)</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#03A9F4' }]}
          onPress={handleGetAccessToken}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Access Token Only</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#00BCD4' }]}
          onPress={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Force Refresh Credentials</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9800' }]}
          onPress={handleClearCredentials}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Clear Credentials Only</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.cardTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Sign Out</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f44336' }]}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Out (clears credentials)</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
});
