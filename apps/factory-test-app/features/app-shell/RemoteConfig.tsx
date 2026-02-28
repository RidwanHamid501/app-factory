import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  useRemoteConfig,
  useRemoteFeatureFlag,
  useConfigBoolean,
  useConfigString,
  useConfigNumber,
  useIsDarkMode,
  type FeatureFlag,
} from '@factory/app-shell';

export function RemoteConfig() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const isDarkMode = useIsDarkMode();

  const config = useRemoteConfig();
  const darkModeFlag: FeatureFlag = useRemoteFeatureFlag('feature_dark_mode');
  const premiumFlag: FeatureFlag = useRemoteFeatureFlag('feature_premium');
  const experimentFlag: FeatureFlag = useRemoteFeatureFlag('feature_experiment');

  const apiTimeout = useConfigNumber('api_timeout', 30000);
  const apiUrl = useConfigString('api_url', 'https://api.example.com');
  const enableLogging = useConfigBoolean('enable_logging', false);
  const maxRetries = useConfigNumber('max_retries', 3);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const clearLog = () => setEventLog([]);

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2a2a2a' : '#fff';
  const textColor = isDarkMode ? '#ffffff' : '#333';
  const labelColor = isDarkMode ? '#999' : '#666';
  const borderColor = isDarkMode ? '#444' : '#f0f0f0';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { backgroundColor: cardBackground, color: textColor }]}>Remote Config & Feature Flags</Text>

      {/* Current Status */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Current Status</Text>
        <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Initialized:</Text>
          <Text style={[styles.value, { color: textColor }, config.isInitialized && styles.success]}>
            {config.isInitialized ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Fetching:</Text>
          <Text style={[styles.value, { color: textColor }, config.isFetching && styles.warning]}>
            {config.isFetching ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Source:</Text>
          <Text style={[styles.value, { color: textColor }]}>{config.source}</Text>
        </View>
        <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Last Fetch Status:</Text>
          <Text style={[styles.value, { color: textColor }]}>{config.lastFetchStatus}</Text>
        </View>
        {config.lastFetchTime && (
          <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: labelColor }]}>Last Fetch Time:</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {new Date(config.lastFetchTime).toLocaleTimeString()}
            </Text>
          </View>
        )}
        {config.error && (
          <View style={[styles.statusRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: labelColor }]}>Error:</Text>
            <Text style={[styles.value, styles.error]}>
              {config.error.message}
            </Text>
          </View>
        )}
      </View>

      {/* Feature Flags */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Feature Flags</Text>
        
        <View style={[styles.flagRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Dark Mode:</Text>
          <Text style={[styles.value, { color: textColor }, darkModeFlag.enabled && styles.success]}>
            {darkModeFlag.enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        <View style={[styles.flagRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Premium Features:</Text>
          <Text style={[styles.value, { color: textColor }, premiumFlag.enabled && styles.success]}>
            {premiumFlag.enabled ? 'Enabled' : 'Disabled'}
          </Text>
          {premiumFlag.variant && (
            <Text style={[styles.subtext, { color: labelColor }]}>Variant: {premiumFlag.variant}</Text>
          )}
        </View>

        <View style={[styles.flagRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Experiment:</Text>
          <Text style={[styles.value, { color: textColor }, experimentFlag.enabled && styles.success]}>
            {experimentFlag.enabled ? 'Enabled' : 'Disabled'}
          </Text>
          {experimentFlag.variant && (
            <Text style={[styles.subtext, { color: labelColor }]}>Variant: {experimentFlag.variant}</Text>
          )}
          {experimentFlag.metadata && (
            <Text style={[styles.subtext, { color: labelColor }]}>
              Metadata: {JSON.stringify(experimentFlag.metadata)}
            </Text>
          )}
        </View>
      </View>

      {/* Config Values */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Config Values</Text>
        
        <View style={[styles.configRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>API Timeout (number):</Text>
          <Text style={[styles.value, { color: textColor }]}>{apiTimeout}ms</Text>
        </View>

        <View style={[styles.configRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>API URL (string):</Text>
          <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>{apiUrl}</Text>
        </View>

        <View style={[styles.configRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Enable Logging (boolean):</Text>
          <Text style={[styles.value, { color: textColor }, enableLogging && styles.success]}>
            {enableLogging ? 'True' : 'False'}
          </Text>
        </View>

        <View style={[styles.configRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: labelColor }]}>Max Retries (number):</Text>
          <Text style={[styles.value, { color: textColor }]}>{maxRetries}</Text>
        </View>
      </View>

      {/* Test Actions */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Test Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            addLog('RemoteConfig: Logged current state');
            addLog(`Source: ${config.source}, Initialized: ${config.isInitialized}`);
          }}
        >
          <Text style={styles.buttonText}>Log Current State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            addLog('RemoteConfig: All config keys');
            Object.keys(config.config.values).forEach((key) => {
              addLog(`  ${key}: ${config.config.values[key]}`);
            });
          }}
        >
          <Text style={styles.buttonText}>Show All Config Keys</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            addLog('RemoteConfig: Feature flag states logged');
            addLog(`  Dark Mode: ${darkModeFlag.enabled}`);
            addLog(`  Premium: ${premiumFlag.enabled}`);
            addLog(`  Experiment: ${experimentFlag.enabled}`);
          }}
        >
          <Text style={styles.buttonText}>Log Feature Flags</Text>
        </TouchableOpacity>
      </View>

      {/* Event Log */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <View style={styles.logHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Event Log</Text>
          <TouchableOpacity onPress={clearLog}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.logContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9' }]}>
          {eventLog.length === 0 ? (
            <Text style={[styles.logEmpty, { color: labelColor }]}>No events yet</Text>
          ) : (
            eventLog.map((log, index) => (
              <Text key={index} style={[styles.logText, { color: textColor }]}>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  section: {
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  flagRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 12,
    marginTop: 4,
  },
  success: {
    color: '#4caf50',
  },
  warning: {
    color: '#ff9800',
  },
  error: {
    color: '#f44336',
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
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
    color: '#2196f3',
    fontSize: 14,
    fontWeight: '600',
  },
  logContainer: {
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  logEmpty: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
