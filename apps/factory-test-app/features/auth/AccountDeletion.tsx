import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Switch, ScrollView } from 'react-native';
import {
  useDeletion,
  setDeletionCallback,
  initializeAuth0,
  useSignIn,
  getUserProfile,
  clearCredentials,
  type DeletionCallback,
  type UserProfile,
} from '@factory/auth-lite';

export function AccountDeletion() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const deletion = useDeletion();
  const { signIn, isLoading: signInLoading, isReady, credentials } = useSignIn();
  const [log, setLog] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const deletionCallbackRef = React.useRef<DeletionCallback | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  // Load user profile when credentials become available
  useEffect(() => {
    const loadProfile = async () => {
      if (credentials && !userProfile) {
        addLog('Loading profile...');
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          addLog('Profile loaded');
        } catch (error) {
          addLog(`Profile load error: ${error}`);
        }
      }
    };
    loadProfile();
  }, [credentials, userProfile]);

  // Handle deletion after credentials are available
  useEffect(() => {
    const processDeletion = async () => {
      if (!needsReauth || !userProfile || !credentials) {
        return;
      }

      try {
        addLog('Proceeding with deletion...');
        addLog('Invoking deletion callback...');
        
        const userId = userProfile.sub;
        if (deletionCallbackRef.current) {
          await deletionCallbackRef.current(userId, {
            accessToken: credentials.accessToken,
            idToken: credentials.idToken,
            expiresAt: credentials.expiresAt instanceof Date ? credentials.expiresAt : new Date(credentials.expiresAt),
            refreshToken: credentials.refreshToken,
          });
          
          addLog('Deletion callback completed successfully');
          addLog('Clearing local credentials...');
          await clearCredentials();
          setUserProfile(null);
          setNeedsReauth(false);
          deletion.cancelDeletion();
          addLog('Account deletion complete!');
        } else {
          addLog('Error: No deletion callback registered');
          setNeedsReauth(false);
        }
      } catch (error) {
        addLog(`Deletion error: ${error}`);
        setNeedsReauth(false);
      }
    };

    processDeletion();
  }, [needsReauth, userProfile, credentials]);

  const handleInitialize = () => {
    try {
      initializeAuth0({
        domain: 'dev-pg5yk4yan4et555s.us.auth0.com',
        clientId: 'NBNgnJLOvtOqsmj8LgAvlUbXkGbJKwuP',
        scheme: 'factorytest',
      });

      const callback: DeletionCallback = async (userId, credentials) => {
        addLog(`Deletion callback invoked`);
        addLog(`User ID: ${userId.substring(0, 16)}...`);
        addLog(`Access Token: ${credentials.accessToken.substring(0, 20)}...`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        addLog('Backend deletion completed (simulated)');
      };

      deletionCallbackRef.current = callback;
      setDeletionCallback(callback);
      addLog('Auth0 initialized and deletion callback set');
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

    try {
      addLog('Starting sign-in...');
      await signIn('google-oauth2');
    } catch (error) {
      addLog(`Sign-in error: ${error}`);
    }
  };

  const handleInitiateDeletion = () => {
    deletion.initiateDeletion();
    addLog('Deletion confirmation shown');
  };

  const handleConfirmDeletion = async () => {
    if (!deletion.acknowledged) {
      addLog('Error: Must acknowledge warning');
      return;
    }

    if (!userProfile) {
      addLog('Error: No user signed in');
      return;
    }

    addLog('User confirmed deletion, proceeding...');
    setNeedsReauth(true);
    
    if (credentials) {
      addLog('Using existing session for deletion...');
    } else {
      addLog('No active session, requesting sign-in...');
      try {
        await signIn('google-oauth2');
      } catch (error) {
        addLog(`Sign-in failed: ${error}`);
        setNeedsReauth(false);
      }
    }
  };

  const handleCancelDeletion = () => {
    deletion.cancelDeletion();
    addLog('Deletion cancelled');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Deletion Test</Text>
        <Text style={styles.subtitle}>Legal Confirmation Flow</Text>
      </View>

      {userProfile ? (
        <View style={styles.profileContainer}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <Text style={styles.profileText}>ID: {userProfile.sub}</Text>
          <Text style={styles.profileText}>Email: {userProfile.email || 'N/A'}</Text>
        </View>
      ) : (
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileText}>Not signed in</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleInitialize}
        >
          <Text style={styles.buttonText}>Initialize Auth0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignIn}
          disabled={signInLoading || !initialized}
        >
          <Text style={styles.buttonText}>
            {signInLoading ? 'Processing...' : 'Sign In (Google)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleInitiateDeletion}
          disabled={!userProfile || deletion.isDeleting}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={deletion.isConfirmationOpen}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{deletion.warning.title}</Text>
            <Text style={styles.modalMessage}>{deletion.warning.message}</Text>

            <View style={styles.consequencesContainer}>
              <Text style={styles.consequencesTitle}>Consequences:</Text>
              {deletion.warning.consequences.map((consequence, index) => (
                <Text key={index} style={styles.consequenceText}>
                  • {consequence}
                </Text>
              ))}
            </View>

            <View style={styles.acknowledgmentRow}>
              <Switch
                value={deletion.acknowledged}
                onValueChange={deletion.setAcknowledged}
              />
              <Text style={styles.acknowledgmentText}>
                I understand this action is permanent
              </Text>
            </View>

            {deletion.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{deletion.error}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelDeletion}
                disabled={deletion.isDeleting}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmDeletion}
                disabled={deletion.isDeleting || !deletion.acknowledged}
              >
                <Text style={styles.buttonText}>
                  {deletion.isDeleting ? 'Processing...' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.logContainer}>
        <Text style={styles.sectionTitle}>Event Log</Text>
        <ScrollView style={styles.logScrollContainer}>
          {[...log].reverse().map((entry, index) => (
            <Text key={index} style={styles.logEntry}>{entry}</Text>
          ))}
        </ScrollView>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Flow:</Text>
        <Text style={styles.instructionsText}>
          1. Initialize Auth0 and set deletion callback{'\n'}
          2. Sign in with Google{'\n'}
          3. Tap "Delete Account"{'\n'}
          4. Read legal warnings{'\n'}
          5. Toggle acknowledgment switch{'\n'}
          6. Confirm deletion (uses existing session){'\n'}
          7. Observe callback invocation in log{'\n'}
          8. Account deleted and credentials cleared
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
  profileContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noProfileContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  noProfileText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  consequencesContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  consequenceText: {
    fontSize: 13,
    color: '#991b1b',
    marginBottom: 4,
  },
  acknowledgmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  acknowledgmentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  logContainer: {
    marginBottom: 16,
  },
  logScrollContainer: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    maxHeight: 150,
  },
  logEntry: {
    color: '#d4d4d4',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
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
