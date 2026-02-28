import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  useAdapter,
  useIsAdapterRegistered,
  useAdapterConfig,
  useAdapterTheme,
  useAdapterSettings,
  useAdapterStrings,
  useAdapterFeatureFlags,
  useAdapterLinkingPrefixes,
  useAdapterRegistry,
  useIsDarkMode,
} from '@factory/app-shell';

export function Adapter() {
  const [logs, setLogs] = useState<string[]>([]);
  const isDarkMode = useIsDarkMode();
  const adapter = useAdapter();
  const isRegistered = useIsAdapterRegistered();
  const config = useAdapterConfig();
  const theme = useAdapterTheme();
  const settings = useAdapterSettings();
  const strings = useAdapterStrings();
  const featureFlags = useAdapterFeatureFlags();
  const linkingPrefixes = useAdapterLinkingPrefixes();
  const getScreens = useAdapterRegistry((state: { getScreens: () => unknown[] }) => state.getScreens);
  const getProviders = useAdapterRegistry((state: { getProviders: () => unknown[] }) => state.getProviders);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const screens = getScreens();
  const providers = getProviders();

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Adapter Integration Test</Text>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Registration Status</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>Registered: {isRegistered ? '✅ Yes' : '❌ No'}</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>Adapter Name: {adapter?.name || 'N/A'}</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>Adapter Version: {adapter?.version || 'N/A'}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Screens ({screens?.length || 0})</Text>
        {screens?.map((screen: any, idx: number) => (
          <Text key={idx} style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
            • {String(screen.name)} - {screen.options?.title || 'No title'}
          </Text>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Providers ({providers?.length || 0})</Text>
        {providers?.map((provider: any, idx: number) => (
          <Text key={idx} style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
            • {provider.name} (order: {provider.order ?? 100})
          </Text>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Theme Config</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Light Theme: {theme.light ? JSON.stringify(theme.light).substring(0, 50) : 'None'}
        </Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          Dark Theme: {theme.dark ? JSON.stringify(theme.dark).substring(0, 50) : 'None'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Settings</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {Object.keys(settings).length > 0
            ? Object.entries(settings)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : 'No settings'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Strings</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {Object.keys(strings).length > 0
            ? Object.entries(strings)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : 'No strings'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Feature Flags</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {Object.keys(featureFlags).length > 0
            ? Object.entries(featureFlags)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            : 'No feature flags'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Linking Prefixes</Text>
        <Text style={[styles.text, { color: isDarkMode ? '#ccc' : '#666' }]}>
          {linkingPrefixes.length > 0 ? linkingPrefixes.join(', ') : 'No prefixes'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Actions</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            addLog('Config sections accessed');
            addLog(`Theme keys: ${Object.keys(theme).join(', ')}`);
            addLog(`Settings keys: ${Object.keys(settings).join(', ')}`);
            addLog(`Strings keys: ${Object.keys(strings).join(', ')}`);
          }}
        >
          <Text style={styles.buttonText}>Log All Config</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => {
            addLog('Full config object accessed');
            addLog(`Config: ${JSON.stringify(config).substring(0, 100)}...`);
          }}
        >
          <Text style={styles.buttonText}>Log Full Config</Text>
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : 'white' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>Event Log</Text>
        <View style={[styles.logContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9' }]}>
          {logs.length === 0 ? (
            <Text style={[styles.logText, { color: isDarkMode ? '#888' : '#333' }]}>No events logged yet</Text>
          ) : (
            logs.map((log, idx) => (
              <Text key={idx} style={[styles.logText, { color: isDarkMode ? '#ccc' : '#333' }]}>
                {log}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logContainer: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});
