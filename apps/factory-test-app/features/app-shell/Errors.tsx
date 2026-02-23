import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useErrorHandler } from '@factory/app-shell';

interface ErrorsProps {
  onEvent: (event: string) => void;
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

// Module-level counter that persists across error boundary resets
let asyncErrorCount = 0;

const BuggyComponent = ({ shouldError }: { shouldError: boolean }) => {
  if (shouldError) {
    throw new Error('💥 Intentional rendering error for testing');
  }
  return <Text style={styles.successText}>✓ Component rendered successfully</Text>;
};

export function Errors({ onEvent, isDarkMode, cardBackground, textColor, secondaryText }: ErrorsProps) {
  const [showBuggy, setShowBuggy] = useState(false);
  const [, forceUpdate] = useState({});
  const handleError = useErrorHandler();

  const throwRenderError = () => {
    onEvent('Errors: Triggering render error');
    setShowBuggy(true);
  };

  const throwAsyncError = () => {
    onEvent('Errors: Triggering async error via useErrorHandler');
    
    asyncErrorCount += 1;
    const currentCount = asyncErrorCount;
    forceUpdate({});
    
    setTimeout(() => {
      try {
        throw new Error(`Async error #${currentCount} - Network timeout`);
      } catch (error) {
        handleError(error as Error, {
          type: 'network',
          operation: 'fetchUserData',
          timestamp: Date.now(),
        });
      }
    }, 100);
  };

  const throwEventHandlerError = () => {
    onEvent('Errors: Triggering event handler error');
    
    try {
      throw new Error('Event handler error - Invalid form data');
    } catch (error) {
      handleError(error as Error, {
        type: 'validation',
        component: 'ErrorTesting',
        action: 'buttonPress',
      });
    }
  };

  const resetComponent = () => {
    setShowBuggy(false);
    onEvent('Errors: Reset buggy component');
  };

  const buttonBg = isDarkMode ? '#374151' : '#e5e7eb';
  const dangerButtonBg = isDarkMode ? '#7f1d1d' : '#fecaca';
  const dangerButtonText = isDarkMode ? '#fca5a5' : '#991b1b';

  return (
    <View style={[styles.section, { backgroundColor: cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Error Boundaries</Text>
      <Text style={[styles.info, { color: secondaryText }]}>
        Test error catching and recovery mechanisms
      </Text>

      <View style={styles.testSection}>
        <Text style={[styles.testTitle, { color: textColor }]}>1. Render Error Test</Text>
        <Text style={[styles.testDescription, { color: secondaryText }]}>
          Trigger a rendering error that ErrorBoundary should catch and display fallback UI.
        </Text>
        
        {showBuggy ? (
          <View style={styles.buggyContainer}>
            <BuggyComponent shouldError={true} />
          </View>
        ) : (
          <Pressable
            style={[styles.button, { backgroundColor: dangerButtonBg }]}
            onPress={throwRenderError}
          >
            <Text style={[styles.buttonText, { color: dangerButtonText }]}>
              Throw Render Error
            </Text>
          </Pressable>
        )}
        
        {showBuggy && (
          <Pressable
            style={[styles.button, { backgroundColor: buttonBg, marginTop: 8 }]}
            onPress={resetComponent}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Reset Component</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.testSection}>
        <Text style={[styles.testTitle, { color: textColor }]}>2. Async Error Test</Text>
        <Text style={[styles.testDescription, { color: secondaryText }]}>
          Trigger an async error using useErrorHandler hook (simulates network failure).
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: dangerButtonBg }]}
          onPress={throwAsyncError}
        >
          <Text style={[styles.buttonText, { color: dangerButtonText }]}>
            Throw Async Error (Count: {asyncErrorCount})
          </Text>
        </Pressable>
      </View>

      <View style={styles.testSection}>
        <Text style={[styles.testTitle, { color: textColor }]}>3. Event Handler Error Test</Text>
        <Text style={[styles.testDescription, { color: secondaryText }]}>
          Trigger an event handler error using useErrorHandler (simulates validation error).
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: dangerButtonBg }]}
          onPress={throwEventHandlerError}
        >
          <Text style={[styles.buttonText, { color: dangerButtonText }]}>
            Throw Event Error
          </Text>
        </Pressable>
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, { color: textColor }]}>ℹ️ Expected Behavior</Text>
        <Text style={[styles.infoText, { color: secondaryText }]}>
          • Render errors: ErrorBoundary catches and shows fallback UI with "Try Again" button{'\n'}
          • Async/Event errors: useErrorHandler triggers boundary to show fallback{'\n'}
          • Dev mode: Detailed error info + stack trace visible{'\n'}
          • Production: Clean user-friendly error message only{'\n'}
          • All errors logged to console and Sentry (if configured)
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
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  testSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  testDescription: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buggyContainer: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginBottom: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
