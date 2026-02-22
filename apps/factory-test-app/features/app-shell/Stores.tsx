import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Switch, useColorScheme } from 'react-native';
import {
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

interface StoresProps {
  onEvent: (event: string) => void;
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function Stores({ onEvent, isDarkMode, cardBackground, textColor, secondaryText }: StoresProps) {
  const systemColorScheme = useColorScheme();
  const prevSystemColorScheme = useRef(systemColorScheme);

  const theme = useTheme();
  const themeMode = useThemeMode();
  const { setMode: setThemeMode, toggleMode } = useThemeActions();

  const settings = useSettings();
  const language = useLanguage();
  const { updateSettings } = useSettingsActions();

  const flags = useFeatureFlags();
  const isNewUIEnabled = useFeatureFlag('new_ui_enabled');
  const { setFlag } = useFeatureFlagActions();

  const telemetry = useTelemetry();
  const trackEvent = useTrackEvent();
  const trackScreen = useTrackScreen();

  useEffect(() => {
    trackScreen('HomeScreen', { test: true });
    const tracked = telemetry.enabled;
    onEvent(tracked 
      ? 'Telemetry: Tracked HomeScreen view' 
      : 'Telemetry: HomeScreen loaded (tracking disabled)'
    );
  }, []);

  useEffect(() => {
    if (prevSystemColorScheme.current !== systemColorScheme) {
      onEvent(`Theme: System appearance changed to ${systemColorScheme}`);
      prevSystemColorScheme.current = systemColorScheme;
    }
  }, [systemColorScheme]);

  return (
    <>
      {/* Theme Store */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Theme Store</Text>
        <Text style={[styles.info, { color: secondaryText }]}>
          ℹ️ Now uses StoreInitializer with theme config in App.tsx
        </Text>
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

      {/* Settings Store */}
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
              onEvent(`Settings: notifications.enabled = ${value}`);
            }}
          />
        </View>
        <View style={styles.buttonRow}>
          <Pressable 
            onPress={() => {
              updateSettings({ language: 'es' });
              onEvent('Settings: Changed language to Spanish');
            }} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>ES</Text>
          </Pressable>
          <Pressable 
            onPress={() => {
              updateSettings({ language: 'fr' });
              onEvent('Settings: Changed language to French');
            }} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>FR</Text>
          </Pressable>
          <Pressable 
            onPress={() => {
              updateSettings({ currency: 'EUR' });
              onEvent('Settings: Changed currency to EUR');
            }} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>EUR</Text>
          </Pressable>
        </View>
      </View>

      {/* Feature Flags Store */}
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
              onEvent('Flag: new_ui_enabled = true');
            }} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>Enable New UI</Text>
          </Pressable>
          <Pressable 
            onPress={() => {
              setFlag('beta_features', true);
              onEvent('Flag: beta_features = true');
            }} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>Enable Beta</Text>
          </Pressable>
        </View>
      </View>

      {/* Telemetry Store */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Telemetry Store</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: secondaryText }]}>Telemetry Enabled:</Text>
          <Switch
            value={telemetry.enabled}
            onValueChange={(value) => {
              telemetry.setEnabled(value);
              onEvent(`Telemetry: ${value ? 'enabled' : 'disabled'}`);
            }}
          />
        </View>
        <View style={styles.buttonRow}>
          <Pressable 
            onPress={() => {
              trackEvent('button_click', { button: 'test_button' });
              const tracked = telemetry.enabled;
              onEvent(tracked 
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
              onEvent(tracked 
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
    </>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  info: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
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
});
