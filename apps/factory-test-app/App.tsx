import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StoreInitializer, useIsDarkMode } from '@factory/app-shell';
import { Lifecycle, Stores } from './features/app-shell';
import { EventLog } from './components';

export default function App() {
  return (
    <StoreInitializer>
      <AppContent />
    </StoreInitializer>
  );
}

function AppContent() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const isDarkMode = useIsDarkMode();

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
        
        {/* App Shell Features */}
        <Stores 
          onEvent={addEvent}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

        <Lifecycle 
          onEvent={addEvent}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

        {/* Event Log */}
        <EventLog 
          events={events}
          onClear={clearEvents}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

        {/* Test Instructions */}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 13,
    lineHeight: 20,
  },
});
