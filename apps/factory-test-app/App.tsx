import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Pressable, Switch, useColorScheme } from 'react-native';
import {
  StoreInitializer,
  lifecycleManager,
  useAppState,
  useStartupType,
  useColdStart,
  useWarmStart,
  useAppActive,
  useAppBackground,
  useLifecycleStore,
  useTheme,
  useThemeMode,
  useThemeActions,
  useIsDarkMode,
  useSettings,
  useSettingsActions,
  useLanguage,
  useFeatureFlag,
  useFeatureFlags,
  useFeatureFlagActions,
  useTrackEvent,
  useTrackScreen,
  useTelemetry,
} from '@factory/app-shell';

export default function App() {
  return (
    <StoreInitializer>
      <AppContent />
    </StoreInitializer>
  );
}

function AppContent() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const [isLifecycleInit, setIsLifecycleInit] = useState(false);
  const systemColorScheme = useColorScheme();
  const prevSystemColorScheme = useRef(systemColorScheme);

  // Lifecycle hooks
  const appState = useAppState();
  const startupType = useStartupType();
  const isColdStart = useColdStart();
  const isWarmStart = useWarmStart();
  const lifecycleState = useLifecycleStore();

  // Theme hooks
  const theme = useTheme();
  const themeMode = useThemeMode();
  const isDarkMode = useIsDarkMode();
  const { setMode: setThemeMode, toggleMode } = useThemeActions();

  // Settings hooks
  const settings = useSettings();
  const language = useLanguage();
  const { updateSettings } = useSettingsActions();

  // Feature flags hooks
  const flags = useFeatureFlags();
  const isNewUIEnabled = useFeatureFlag('new_ui_enabled');
  const { setFlag } = useFeatureFlagActions();

  // Telemetry hooks
  const telemetry = useTelemetry();
  const trackEvent = useTrackEvent();
  const trackScreen = useTrackScreen();

  useAppActive(() => {
    addEvent('Hook: useAppActive fired');
  });

  useAppBackground(() => {
    addEvent('Hook: useAppBackground fired');
  });

  useEffect(() => {
    if (prevSystemColorScheme.current !== systemColorScheme) {
      addEvent(`Theme: System appearance changed to ${systemColorScheme}`);
      prevSystemColorScheme.current = systemColorScheme;
    }
  }, [systemColorScheme]);

  useEffect(() => {
    lifecycleManager.initialize();
    setIsLifecycleInit(true);
    addEvent('LifecycleManager initialized');
    
    trackScreen('HomeScreen', { test: true });
    const tracked = telemetry.enabled;
    addEvent(tracked 
      ? 'Telemetry: Tracked HomeScreen view' 
      : 'Telemetry: HomeScreen loaded (tracking disabled)'
    );

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

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: textColor }]}>
          @factory/app-shell Integration Test
        </Text>
        
        {/* Theme Store Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Theme Store</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Theme Mode:</Text>
            <Text style={[styles.value, { color: textColor }]}>{themeMode}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>System Appearance:</Text>
            <Text style={[styles.value, { color: textColor }]}>{systemColorScheme || 'null'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Is Dark Mode:</Text>
            <Text style={[styles.value, { color: isDarkMode ? '#10b981' : '#6b7280' }]}>
              {isDarkMode ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Primary Color:</Text>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
          </View>
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setThemeMode('light')} style={styles.button}>
              <Text style={styles.buttonText}>Light</Text>
            </Pressable>
            <Pressable onPress={() => setThemeMode('dark')} style={styles.button}>
              <Text style={styles.buttonText}>Dark</Text>
            </Pressable>
            <Pressable onPress={() => setThemeMode('auto')} style={styles.button}>
              <Text style={styles.buttonText}>Auto</Text>
            </Pressable>
            <Pressable onPress={toggleMode} style={[styles.button, styles.buttonPrimary]}>
              <Text style={styles.buttonText}>Toggle</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings Store Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Settings Store</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Language:</Text>
            <Text style={[styles.value, { color: textColor }]}>{language}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Currency:</Text>
            <Text style={[styles.value, { color: textColor }]}>{settings.currency}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Unit System:</Text>
            <Text style={[styles.value, { color: textColor }]}>{settings.unitSystem}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Notifications:</Text>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={(value) => {
                updateSettings({ notifications: { enabled: value } });
                addEvent(`Settings: notifications.enabled = ${value}`);
              }}
            />
          </View>
          <View style={styles.buttonRow}>
            <Pressable 
              onPress={() => {
                updateSettings({ language: 'es' });
                addEvent('Settings: Changed language to Spanish');
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>ES</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                updateSettings({ language: 'fr' });
                addEvent('Settings: Changed language to French');
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>FR</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                updateSettings({ currency: 'EUR' });
                addEvent('Settings: Changed currency to EUR');
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>EUR</Text>
            </Pressable>
          </View>
        </View>

        {/* Feature Flags Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Feature Flags Store</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>new_ui_enabled:</Text>
            <Text style={[styles.value, { color: isNewUIEnabled ? '#10b981' : '#6b7280' }]}>
              {String(isNewUIEnabled)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>analytics_enabled:</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {String(flags['analytics_enabled'])}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>beta_features:</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {String(flags['beta_features'])}
            </Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable 
              onPress={() => {
                setFlag('new_ui_enabled', true);
                addEvent('Flag: new_ui_enabled = true');
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>Enable New UI</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                setFlag('beta_features', true);
                addEvent('Flag: beta_features = true');
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>Enable Beta</Text>
            </Pressable>
          </View>
        </View>

        {/* Telemetry Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Telemetry Store</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Telemetry Enabled:</Text>
            <Switch
              value={telemetry.enabled}
              onValueChange={(value) => {
                telemetry.setEnabled(value);
                addEvent(`Telemetry: ${value ? 'enabled' : 'disabled'}`);
              }}
            />
          </View>
          <View style={styles.buttonRow}>
            <Pressable 
              onPress={() => {
                trackEvent('button_click', { button: 'test_button' });
                const tracked = telemetry.enabled;
                addEvent(tracked 
                  ? 'Telemetry: Tracked button_click event' 
                  : 'Telemetry: Button pressed (tracking disabled)'
                );
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>Track Event</Text>
            </Pressable>
            <Pressable 
              onPress={() => {
                trackScreen('TestScreen', { from: 'integration_test' });
                const tracked = telemetry.enabled;
                addEvent(tracked 
                  ? 'Telemetry: Tracked TestScreen view' 
                  : 'Telemetry: Screen pressed (tracking disabled)'
                );
              }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>Track Screen</Text>
            </Pressable>
          </View>
        </View>

        {/* Lifecycle Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Lifecycle (Existing)</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Manager Initialized:</Text>
            <Text style={[styles.value, isLifecycleInit ? styles.success : styles.error]}>
              {isLifecycleInit ? '✓ Yes' : '✗ No'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>App State:</Text>
            <Text style={[styles.value, { color: textColor }]}>{appState}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Startup Type:</Text>
            <Text style={[styles.value, { color: textColor }]}>{startupType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: secondaryText }]}>Session ID:</Text>
            <Text style={[styles.value, styles.small, { color: secondaryText }]}>
              {lifecycleState.sessionId}
            </Text>
          </View>
        </View>

        {/* Event Log */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Event Log (Last 20)</Text>
            <Pressable onPress={clearEvents} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          </View>
          {events.length === 0 ? (
            <Text style={[styles.noEvents, { color: secondaryText }]}>
              No events yet. Try interacting with the stores above.
            </Text>
          ) : (
            events.map((entry, index) => (
              <View key={index} style={[styles.eventRow, { borderBottomColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
                <Text style={[styles.eventTime, { color: secondaryText }]}>{entry.time}</Text>
                <Text style={[styles.eventText, { color: textColor }]}>{entry.event}</Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Test Instructions</Text>
          <Text style={[styles.instructions, { color: secondaryText }]}>
            See integration_tests/app-shell.md for detailed test plan
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
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
    flex: 1,
  },
  value: {
    fontSize: 14,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
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
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  eventRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  eventTime: {
    fontSize: 12,
    width: 80,
  },
  eventText: {
    fontSize: 12,
    flex: 1,
  },
  instructions: {
    fontSize: 13,
    lineHeight: 20,
  },
});
