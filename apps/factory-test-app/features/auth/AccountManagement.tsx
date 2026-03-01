import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  getUserProfile,
  type UserProfile,
  initializeAuth0,
  useSignIn,
  signOut,
} from '@factory/auth-lite';

export function AccountManagement() {
  const { signIn, isLoading: signInLoading, isReady, credentials } = useSignIn();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Load profile on mount if already signed in
    const loadProfile = async () => {
      const profile = await getUserProfile();
      setUserProfile(profile);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    // Load profile when credentials become available
    if (credentials) {
      const loadProfile = async () => {
        const profile = await getUserProfile();
        setUserProfile(profile);
        setMessage('Sign-in successful - profile loaded');
        setLoading(false);
      };
      loadProfile();
    }
  }, [credentials]);

  const handleInitialize = () => {
    try {
      initializeAuth0({
        domain: 'dev-pg5yk4yan4et555s.us.auth0.com',
        clientId: 'NBNgnJLOvtOqsmj8LgAvlUbXkGbJKwuP',
        scheme: 'factorytest',
      });
      setMessage('Auth0 initialized');
      setInitialized(true);
    } catch (error: any) {
      setMessage(`Init error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    if (!initialized) {
      setMessage('Error: Initialize Auth0 first');
      return;
    }
    
    if (!isReady) {
      setMessage('Error: Auth0 not ready yet');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await signIn('google-oauth2');
    } catch (error: any) {
      setMessage(`Sign-in error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');
    try {
      await signOut();
      setUserProfile(null);
      setMessage('Sign-out successful');
    } catch (error: any) {
      setMessage(`Sign-out error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Management Test</Text>
        <Text style={styles.subtitle}>User Profile Read APIs</Text>
      </View>

      {userProfile ? (
        <View style={styles.profileContainer}>
          <Text style={styles.sectionTitle}>User Profile</Text>
          <Text style={styles.profileText}>ID: {userProfile.sub}</Text>
          <Text style={styles.profileText}>Email: {userProfile.email || 'N/A'}</Text>
          <Text style={styles.profileText}>Name: {userProfile.name || 'N/A'}</Text>
          <Text style={styles.profileText}>
            Given: {userProfile.given_name || 'N/A'}
          </Text>
          <Text style={styles.profileText}>
            Family: {userProfile.family_name || 'N/A'}
          </Text>
          <Text style={styles.profileText}>
            Nickname: {userProfile.nickname || 'N/A'}
          </Text>
          <Text style={styles.profileText}>
            Verified: {userProfile.email_verified ? '✅ Yes' : '❌ No'}
          </Text>
          {userProfile.picture && (
            <Text style={styles.profileText}>
              Avatar: {userProfile.picture.substring(0, 40)}...
            </Text>
          )}
          {userProfile.updated_at && (
            <Text style={styles.profileText}>
              Updated: {new Date(userProfile.updated_at).toLocaleString()}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.noProfileContainer}>
          <Text style={styles.noProfileText}>No user profile</Text>
          <Text style={styles.noProfileSubtext}>Sign in to load profile</Text>
        </View>
      )}

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
          style={[styles.button, styles.dangerButton]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Flow:</Text>
        <Text style={styles.instructionsText}>
          1. Initialize Auth0{'\n'}
          2. Sign in with Google{'\n'}
          3. Observe user profile loads automatically{'\n'}
          4. Verify all profile fields (email, name, etc.){'\n'}
          5. Check email verification status{'\n'}
          6. Sign out and observe profile clears
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
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  noProfileContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#94a3b8',
  },
  noProfileText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  noProfileSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
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
  messageContainer: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    color: '#1e40af',
    fontSize: 13,
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
