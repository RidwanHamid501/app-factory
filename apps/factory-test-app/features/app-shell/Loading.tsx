import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { 
  useAppReady, 
  useLoadingState, 
  useSplashControl,
  LoadingOverlay 
} from '@factory/app-shell';

interface LoadingProps {
  onEvent: (event: string) => void;
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function Loading({ onEvent, isDarkMode, cardBackground, textColor, secondaryText }: LoadingProps) {
  const { isAppReady, isInitializing } = useAppReady();
  const { 
    completedTasks, 
    failedTasks, 
    currentTask, 
    completedCount, 
    failedCount 
  } = useLoadingState();
  const { hideSplash, isSplashVisible } = useSplashControl();
  
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  const handleHideSplash = async () => {
    onEvent('Loading: Manually hiding splash');
    await hideSplash();
    onEvent('Loading: Splash hidden');
  };

  const handleCheckVisibility = () => {
    const visible = isSplashVisible();
    onEvent(`Loading: Splash visible = ${visible}`);
  };

  const showLoadingOverlay = () => {
    onEvent('Loading: Showing loading overlay');
    setOverlayMessage('Processing your request...');
    setShowOverlay(true);
    
    setTimeout(() => {
      setShowOverlay(false);
      onEvent('Loading: Loading overlay hidden');
    }, 2000);
  };

  const showTransparentOverlay = () => {
    onEvent('Loading: Showing transparent overlay');
    setOverlayMessage('Please wait...');
    setShowOverlay(true);
    
    setTimeout(() => {
      setShowOverlay(false);
      onEvent('Loading: Transparent overlay hidden');
    }, 2000);
  };

  const buttonBg = isDarkMode ? '#374151' : '#e5e7eb';
  const successBg = isDarkMode ? '#065f46' : '#d1fae5';
  const successText = isDarkMode ? '#10b981' : '#047857';

  return (
    <View style={[styles.section, { backgroundColor: cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        App-Wide Loading & Splash
      </Text>
      <Text style={[styles.info, { color: secondaryText }]}>
        Test splash screen control and loading states
      </Text>

      <View style={styles.statusSection}>
        <Text style={[styles.statusTitle, { color: textColor }]}>Current Status</Text>
        
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryText }]}>App Ready:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isAppReady ? successBg : buttonBg }
          ]}>
            <Text style={[
              styles.statusValue, 
              { color: isAppReady ? successText : textColor }
            ]}>
              {isAppReady ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryText }]}>Initializing:</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isInitializing ? buttonBg : successBg }
          ]}>
            <Text style={[
              styles.statusValue, 
              { color: isInitializing ? textColor : successText }
            ]}>
              {isInitializing ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryText }]}>Completed Tasks:</Text>
          <Text style={[styles.statusValue, { color: textColor }]}>{completedCount}</Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: secondaryText }]}>Failed Tasks:</Text>
          <Text style={[styles.statusValue, { color: textColor }]}>{failedCount}</Text>
        </View>

        {failedTasks.length > 0 && (
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: secondaryText }]}>Failed:</Text>
            <Text style={[styles.statusValue, { color: '#ef4444' }]}>
              {failedTasks.join(', ')}
            </Text>
          </View>
        )}

        {currentTask && (
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: secondaryText }]}>Current Task:</Text>
            <Text style={[styles.statusValue, { color: textColor }]}>{currentTask}</Text>
          </View>
        )}
      </View>

      <View style={styles.testSection}>
        <Text style={[styles.testTitle, { color: textColor }]}>1. Splash Control</Text>
        <Text style={[styles.testDescription, { color: secondaryText }]}>
          Manually control the native splash screen (if visible)
        </Text>
        
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, { backgroundColor: buttonBg }]}
            onPress={handleHideSplash}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Hide Splash</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: buttonBg }]}
            onPress={handleCheckVisibility}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Check Visibility</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.testSection}>
        <Text style={[styles.testTitle, { color: textColor }]}>2. Loading Overlay</Text>
        <Text style={[styles.testDescription, { color: secondaryText }]}>
          Display full-screen loading overlays for async operations
        </Text>
        
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.button, { backgroundColor: buttonBg }]}
            onPress={showLoadingOverlay}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Show Overlay</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: buttonBg }]}
            onPress={showTransparentOverlay}
          >
            <Text style={[styles.buttonText, { color: textColor }]}>Show Transparent</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.infoTitle, { color: textColor }]}>ℹ️ Testing Info</Text>
        <Text style={[styles.infoText, { color: secondaryText }]}>
          • App initialization runs on startup{'\n'}
          • Splash screen hides automatically when ready{'\n'}
          • Loading state tracks all initialization tasks{'\n'}
          • Overlay can be shown for any async operation{'\n'}
          • All hooks provide real-time status updates
        </Text>
      </View>

      <LoadingOverlay 
        visible={showOverlay} 
        message={overlayMessage}
        transparent={overlayMessage.includes('wait')}
      />
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
  statusSection: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 13,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  testSection: {
    marginBottom: 16,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
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
