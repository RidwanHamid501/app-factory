import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import {
  lifecycleManager,
  useAppState,
  useStartupType,
  useColdStart,
  useWarmStart,
  useAppActive,
  useAppBackground,
  useLifecycleStore,
} from '@factory/app-shell';

export default function App() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const appState = useAppState();
  const startupType = useStartupType();
  const isColdStart = useColdStart();
  const isWarmStart = useWarmStart();
  
  const lifecycleState = useLifecycleStore();

  useAppActive(() => {
    addEvent('Hook: useAppActive fired');
  });

  useAppBackground(() => {
    addEvent('Hook: useAppBackground fired');
  });

  useEffect(() => {
    lifecycleManager.initialize();
    setIsInitialized(true);
    addEvent('LifecycleManager initialized');

    const unsubscribeStarting = lifecycleManager.on('appStarting', () => {
      addEvent('Event: appStarting');
    });

    const unsubscribeActive = lifecycleManager.on('appActive', () => {
      addEvent('Event: appActive');
    });

    const unsubscribeBackground = lifecycleManager.on('appBackground', () => {
      addEvent('Event: appBackground');
    });

    const unsubscribeInactive = lifecycleManager.on('appInactive', () => {
      addEvent('Event: appInactive');
    });

    return () => {
      unsubscribeStarting.unsubscribe();
      unsubscribeActive.unsubscribe();
      unsubscribeBackground.unsubscribe();
      unsubscribeInactive.unsubscribe();
      lifecycleManager.destroy();
    };
  }, []);

  const addEvent = (event: string) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prev => [{ time, event }, ...prev].slice(0, 20));
  };

  const clearEvents = () => setEvents([]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>@factory/app-shell Integration Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initialization Status</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Manager Initialized:</Text>
            <Text style={[styles.value, isInitialized ? styles.success : styles.error]}>
              {isInitialized ? '✓ Yes' : '✗ No'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State (Hooks)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>App State:</Text>
            <Text style={styles.value}>{appState}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Startup Type:</Text>
            <Text style={styles.value}>{startupType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Is Cold Start:</Text>
            <Text style={[styles.value, isColdStart ? styles.success : styles.neutral]}>
              {isColdStart ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Is Warm Start:</Text>
            <Text style={[styles.value, isWarmStart ? styles.success : styles.neutral]}>
              {isWarmStart ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifecycle Store State</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Current State:</Text>
            <Text style={styles.value}>{lifecycleState.currentState}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Previous State:</Text>
            <Text style={styles.value}>{lifecycleState.previousState || 'null'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Session ID:</Text>
            <Text style={[styles.value, styles.small]}>{lifecycleState.sessionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Background Duration:</Text>
            <Text style={styles.value}>{lifecycleState.backgroundDuration}ms</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Active:</Text>
            <Text style={[styles.value, styles.small]}>
              {new Date(lifecycleState.lastActiveTimestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event Log (Last 20)</Text>
            <Pressable onPress={clearEvents} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          </View>
          {events.length === 0 ? (
            <Text style={styles.noEvents}>No events yet. Try backgrounding the app.</Text>
          ) : (
            events.map((entry, index) => (
              <View key={index} style={styles.eventRow}>
                <Text style={styles.eventTime}>{entry.time}</Text>
                <Text style={styles.eventText}>{entry.event}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Instructions</Text>
          <Text style={styles.instructions}>
            1. Observe initial state (should be "cold" start){'\n'}
            2. Background the app (home button or swipe){'\n'}
            3. Return to app quickly (&lt;30s){'\n'}
            4. Check events logged{'\n'}
            5. Background again for &gt;30min{'\n'}
            6. Return and verify "warm" start + new session
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  small: {
    fontSize: 11,
  },
  success: {
    color: '#10b981',
  },
  error: {
    color: '#ef4444',
  },
  neutral: {
    color: '#6b7280',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noEvents: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
    width: 80,
  },
  eventText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  instructions: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
