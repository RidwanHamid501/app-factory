import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  initializeAnonymousId,
  useAnonymousId,
  useIsAnonymous,
  clearAnonymousIdWithCache,
  loadAnonymousId,
  ANONYMOUS_ID_KEY,
} from '@factory/auth-lite';
import { useIsDarkMode } from '@factory/app-shell';

const TestResult: React.FC<{
  testName: string;
  status: 'pending' | 'pass' | 'fail';
  message?: string;
  isDarkMode: boolean;
}> = ({ testName, status, message, isDarkMode }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pass':
        return '#4CAF50';
      case 'fail':
        return '#f44336';
      default:
        return isDarkMode ? '#666' : '#999';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pass':
        return '✓';
      case 'fail':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <View style={[styles.testResult, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
      <View style={styles.testHeader}>
        <Text
          style={[
            styles.testStatus,
            { color: getStatusColor() },
          ]}>
          {getStatusIcon()}
        </Text>
        <Text style={[styles.testName, { color: isDarkMode ? '#fff' : '#000' }]}>
          {testName}
        </Text>
      </View>
      {message && (
        <Text style={[styles.testMessage, { color: isDarkMode ? '#bbb' : '#666' }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export const Anonymous: React.FC = () => {
  const isDarkMode = useIsDarkMode();
  const anonymousId = useAnonymousId();
  const isAnonymous = useIsAnonymous();
  const [isInitialized, setIsInitialized] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{ name: string; status: 'pending' | 'pass' | 'fail'; message?: string }>
  >([
    { name: 'Test 1: Initialize anonymous ID', status: 'pending' },
    { name: 'Test 2: Hook returns valid ID', status: 'pending' },
    { name: 'Test 3: isAnonymous returns true', status: 'pending' },
    { name: 'Test 4: ID persists across renders', status: 'pending' },
    { name: 'Test 5: Clear ID removes it', status: 'pending' },
    { name: 'Test 6: Hook reflects cleared state', status: 'pending' },
    { name: 'Test 7: Can re-initialize after clear', status: 'pending' },
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAnonymousId();
        setIsInitialized(true);
      } catch (error) {
        console.error('[Anonymous Test] Init failed:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      runTest1();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (anonymousId !== undefined) {
      runTest2();
      runTest3();
    }
  }, [anonymousId]);

  const updateTestResult = (
    index: number,
    status: 'pending' | 'pass' | 'fail',
    message?: string
  ) => {
    setTestResults((prev) =>
      prev.map((test, i) => (i === index ? { ...test, status, message } : test))
    );
  };

  const runTest1 = () => {
    if (isInitialized && anonymousId) {
      updateTestResult(0, 'pass', `Initialized: ${anonymousId.substring(0, 8)}...`);
    } else {
      updateTestResult(0, 'fail', 'Failed to initialize');
    }
  };

  const runTest2 = () => {
    if (typeof anonymousId === 'string' && anonymousId.length > 0) {
      updateTestResult(1, 'pass', `ID: ${anonymousId.substring(0, 8)}...`);
    } else {
      updateTestResult(1, 'fail', `Invalid ID type: ${typeof anonymousId}`);
    }
  };

  const runTest3 = () => {
    if (isAnonymous === true) {
      updateTestResult(2, 'pass', 'isAnonymous hook works correctly');
    } else {
      updateTestResult(2, 'fail', `Expected true, got ${isAnonymous}`);
    }
  };

  const runTest4 = async () => {
    try {
      const storedId = await loadAnonymousId();
      if (storedId === anonymousId) {
        updateTestResult(3, 'pass', 'ID persists in AsyncStorage');
      } else {
        updateTestResult(3, 'fail', `Mismatch: ${storedId} vs ${anonymousId}`);
      }
    } catch (error) {
      updateTestResult(3, 'fail', `Error: ${error}`);
    }
  };

  const runTest5 = async () => {
    try {
      await clearAnonymousIdWithCache();
      updateTestResult(4, 'pass', 'ID cleared successfully');
      // Test 6 will run automatically via useEffect
    } catch (error) {
      updateTestResult(4, 'fail', `Error: ${error}`);
    }
  };

  const runTest6 = () => {
    if (anonymousId === null) {
      updateTestResult(5, 'pass', 'Hook reflects cleared state');
    } else {
      updateTestResult(5, 'fail', `Expected null, got ${anonymousId}`);
    }
  };

  const runTest7 = async () => {
    try {
      await initializeAnonymousId();
      // Hook will update automatically
      if (anonymousId && typeof anonymousId === 'string') {
        updateTestResult(6, 'pass', `Re-initialized: ${anonymousId.substring(0, 8)}...`);
      }
    } catch (error) {
      updateTestResult(6, 'fail', `Error: ${error}`);
    }
  };

  useEffect(() => {
    if (anonymousId === null && testResults[4].status === 'pass') {
      runTest6();
    }
  }, [anonymousId]);

  const handleRunAllTests = async () => {
    setTestResults((prev) =>
      prev.map((test) => ({ ...test, status: 'pending' as const, message: undefined }))
    );

    await runTest4();
    setTimeout(() => runTest5(), 500);
    setTimeout(() => runTest7(), 1500);
  };

  if (!isInitialized) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#007AFF' : '#007AFF'} />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#000' }]}>
          Initializing Anonymous Mode...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
        Anonymous Mode Integration Test
      </Text>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Current State
        </Text>
        <View style={styles.stateRow}>
          <Text style={[styles.stateLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>
            Anonymous ID:
          </Text>
          <Text style={[styles.stateValue, { color: isDarkMode ? '#fff' : '#000' }]}>
            {anonymousId ? `${anonymousId.substring(0, 16)}...` : 'null'}
          </Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={[styles.stateLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>
            Is Anonymous:
          </Text>
          <Text style={[styles.stateValue, { color: isDarkMode ? '#fff' : '#000' }]}>
            {String(isAnonymous)}
          </Text>
        </View>
        <View style={styles.stateRow}>
          <Text style={[styles.stateLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>
            Storage Key:
          </Text>
          <Text style={[styles.stateValue, { color: isDarkMode ? '#fff' : '#000' }]}>
            {ANONYMOUS_ID_KEY}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Test Results
        </Text>
        {testResults.map((test, index) => (
          <TestResult
            key={index}
            testName={test.name}
            status={test.status}
            message={test.message}
            isDarkMode={isDarkMode}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleRunAllTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  stateValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  testResult: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  testMessage: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 26,
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
