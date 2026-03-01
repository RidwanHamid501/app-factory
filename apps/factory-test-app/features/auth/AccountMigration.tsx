import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import {
  initializeAuth0,
  useSignIn,
  signOut,
  setMigrationCallback,
  checkAndMigrate,
  resetMigrationFlag,
  useAnonymousId,
  hasValidCredentials,
  initializeAnonymousId,
  type MigrationCallback,
} from '@factory/auth-lite';

export function AccountMigration() {
  const anonymousId = useAnonymousId();
  const { signIn, isLoading: signInLoading, isReady, credentials } = useSignIn();
  const [authStatus, setAuthStatus] = useState<'anonymous' | 'authenticated' | 'unknown'>('unknown');
  const [migrationLog, setMigrationLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (credentials) {
      setAuthStatus('authenticated');
      addLog('Sign-in completed');
      setLoading(false);
    }
  }, [credentials]);

  // Update auth status when anonymous ID changes
  useEffect(() => {
    if (anonymousId && credentials) {
      // Has both anonymous ID and credentials - migration pending/in progress
      setAuthStatus('anonymous');
    } else if (!anonymousId && credentials) {
      // No anonymous ID but has credentials - successfully migrated
      setAuthStatus('authenticated');
    } else if (anonymousId && !credentials) {
      // Has anonymous ID but no credentials - anonymous user
      setAuthStatus('anonymous');
    } else {
      // No anonymous ID and no credentials - unknown state
      setAuthStatus('unknown');
    }
  }, [anonymousId, credentials]);

  const handleInitialize = async () => {
    try {
      initializeAuth0({
        domain: 'dev-pg5yk4yan4et555s.us.auth0.com',
        clientId: 'NBNgnJLOvtOqsmj8LgAvlUbXkGbJKwuP',
        scheme: 'factorytest',
      });

      const callback: MigrationCallback = async (anonId: string, userId: string) => {
        addLog(`Migration callback invoked`);
        addLog(`Anonymous ID: ${anonId.substring(0, 8)}...`);
        addLog(`User ID: ${userId.substring(0, 8)}...`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog('Migration successful');
      };

      setMigrationCallback(callback);
      
      // Generate a new anonymous ID if one doesn't exist
      await initializeAnonymousId();
      
      addLog('Auth0 initialized and migration callback set');
      setAuthStatus('anonymous');
      setInitialized(true);
    } catch (error) {
      addLog(`Initialization error: ${error}`);
    }
  };

  const handleSignIn = async () => {
    if (!initialized) {
      addLog('Error: Initialize Auth0 first');
      return;
    }
    
    if (!isReady) {
      addLog('Error: Auth0 not ready yet');
      return;
    }

    setLoading(true);
    try {
      addLog('Starting sign-in...');
      await signIn('google-oauth2');
    } catch (error) {
      addLog(`Sign-in error: ${error}`);
      setLoading(false);
    }
  };

  const handleManualMigrationCheck = async () => {
    setLoading(true);
    try {
      addLog('Manually checking migration...');
      const migrated = await checkAndMigrate();
      addLog(migrated ? 'Migration executed' : 'No migration needed');
    } catch (error) {
      addLog(`Migration check error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFlag = () => {
    resetMigrationFlag();
    addLog('Migration flag reset');
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      addLog('Starting sign-out...');
      await signOut();
      setAuthStatus('anonymous');
      addLog('Sign-out completed');
    } catch (error) {
      addLog(`Sign-out error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLog = () => {
    setMigrationLog([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Migration Test</Text>
        <Text style={styles.subtitle}>Guest → Authenticated User</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Anonymous ID:</Text>
          <Text style={styles.statusValue}>
            {anonymousId ? `${anonymousId.substring(0, 16)}...` : 'None'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Auth Status:</Text>
          <Text style={[
            styles.statusValue,
            authStatus === 'authenticated' && styles.authenticated,
            authStatus === 'anonymous' && styles.anonymous,
          ]}>
            {authStatus}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleInitialize}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Initialize Auth0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={loading || signInLoading || !initialized}
        >
          <Text style={styles.buttonText}>
            {loading || signInLoading ? 'Processing...' : 'Sign In (Google)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleManualMigrationCheck}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Manual Migration Check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleResetFlag}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Reset Migration Flag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.logHeader}>
          <Text style={styles.sectionTitle}>Migration Log</Text>
          <TouchableOpacity onPress={handleClearLog}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.logContainer}>
          {migrationLog.length === 0 ? (
            <Text style={styles.emptyLog}>No events yet</Text>
          ) : (
            [...migrationLog].reverse().map((log, index) => (
              <Text key={index} style={styles.logEntry}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Flow:</Text>
        <Text style={styles.instructionsText}>
          1. Initialize Auth0 (sets up callback){'\n'}
          2. Note your anonymous ID{'\n'}
          3. Sign in with Google{'\n'}
          4. Migration callback should auto-trigger{'\n'}
          5. Anonymous ID should clear{'\n'}
          6. Try "Manual Migration Check" (should skip){'\n'}
          7. Sign out to test again
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  authenticated: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  anonymous: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#6366f1',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  emptyLog: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logEntry: {
    color: '#d4d4d4',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  instructions: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 18,
  },
});
