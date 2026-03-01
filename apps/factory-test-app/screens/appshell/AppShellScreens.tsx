import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useIsDarkMode } from '@factory/app-shell';
import { Lifecycle } from '../../features/app-shell';

export function LifecycleScreen() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const isDarkMode = useIsDarkMode();

  const addEvent = (event: string) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prev => [{ time, event }, ...prev].slice(0, 20));
  };

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Lifecycle
          onEvent={addEvent}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />
      </ScrollView>
    </View>
  );
}

export function NavigationTestScreen() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const isDarkMode = useIsDarkMode();

  const addEvent = (event: string) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prev => [{ time, event }, ...prev].slice(0, 20));
  };

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation component would go here */}
      </ScrollView>
    </View>
  );
}

export function StoresScreen() {
  const [events, setEvents] = useState<Array<{ time: string; event: string }>>([]);
  const isDarkMode = useIsDarkMode();

  const addEvent = (event: string) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prev => [{ time, event }, ...prev].slice(0, 20));
  };

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stores component would go here */}
      </ScrollView>
    </View>
  );
}

export function LoadingTestScreen() {
  const isDarkMode = useIsDarkMode();
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Loading component would go here */}
      </ScrollView>
    </View>
  );
}

export function ErrorTestScreen() {
  const isDarkMode = useIsDarkMode();
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Errors component would go here */}
      </ScrollView>
    </View>
  );
}

export function RemoteConfigTestScreen() {
  const isDarkMode = useIsDarkMode();
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* RemoteConfig component would go here */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
