import { StyleSheet, Text, View } from 'react-native';
import {
  useAppState,
  useStartupType,
  useColdStart,
  useWarmStart,
  useAppActive,
  useAppBackground,
  useLifecycleStore,
} from '@factory/app-shell';

interface LifecycleProps {
  onEvent: (event: string) => void;
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function Lifecycle({ onEvent, isDarkMode, cardBackground, textColor, secondaryText }: LifecycleProps) {
  const appState = useAppState();
  const startupType = useStartupType();
  const isColdStart = useColdStart();
  const isWarmStart = useWarmStart();
  const lifecycleState = useLifecycleStore();

  useAppActive(() => {
    onEvent('Hook: useAppActive fired');
  });

  useAppBackground(() => {
    onEvent('Hook: useAppBackground fired');
  });

  return (
    <View style={[styles.section, { backgroundColor: cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>App Lifecycle</Text>
      <Text style={[styles.info, { color: secondaryText }]}>
        ℹ️ Now uses LifecycleProvider in App.tsx (config-based)
      </Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>App State:</Text>
        <Text style={[styles.value, { color: textColor }]}>{appState}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Startup Type:</Text>
        <Text style={[styles.value, { color: textColor }]}>{startupType}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Is Cold Start:</Text>
        <Text style={[styles.value, { color: isColdStart ? '#10b981' : '#6b7280' }]}>
          {isColdStart ? 'Yes' : 'No'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Is Warm Start:</Text>
        <Text style={[styles.value, { color: isWarmStart ? '#10b981' : '#6b7280' }]}>
          {isWarmStart ? 'Yes' : 'No'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Session ID:</Text>
        <Text style={[styles.value, styles.small, { color: secondaryText }]}>
          {lifecycleState.sessionId}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Last Active:</Text>
        <Text style={[styles.value, styles.small, { color: secondaryText }]}>
          {lifecycleState.lastActiveTimestamp ? new Date(lifecycleState.lastActiveTimestamp).toLocaleTimeString() : 'N/A'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Background Duration:</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {lifecycleState.backgroundDuration ? `${lifecycleState.backgroundDuration}ms` : 'N/A'}
        </Text>
      </View>
    </View>
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
  small: {
    fontSize: 11,
  },
});
