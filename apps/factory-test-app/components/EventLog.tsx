import { StyleSheet, Text, View, Pressable } from 'react-native';

interface EventLogEntry {
  time: string;
  event: string;
}

interface EventLogProps {
  events: EventLogEntry[];
  onClear: () => void;
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function EventLog({ events, onClear, isDarkMode, cardBackground, textColor, secondaryText }: EventLogProps) {
  return (
    <View style={[styles.section, { backgroundColor: cardBackground }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Event Log (Last 20)</Text>
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>
      {events.length === 0 ? (
        <Text style={[styles.noEvents, { color: secondaryText }]}>
          No events yet. Try interacting with the features above.
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
});
