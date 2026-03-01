import { useState, useMemo, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { 
  LifecycleProvider, 
  StoreInitializer, 
  useIsDarkMode, 
  NavigationContainer,
  ErrorBoundary,
  LoadingProvider,
  RemoteConfigProvider,
  useAdapterRegistry,
  AdapterProvider,
} from '@factory/app-shell';
import { Lifecycle, Stores, Navigation, Errors, Loading, RemoteConfig, Adapter } from './features/app-shell';
import { Anonymous, SocialSignIn, TokenManagement, AccountMigration, AccountManagement, AccountDeletion } from './features/auth';
import { EventLog } from './components';
import { HomeMenuScreen } from './screens/HomeMenuScreen';
import { 
  LifecycleScreen, 
  NavigationTestScreen, 
  StoresScreen, 
  LoadingTestScreen, 
  ErrorTestScreen, 
  RemoteConfigTestScreen,
  AnonymousTestScreen,
} from './screens';
import { factoryTestAdapter } from './adapter/factoryTestAdapter';

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: { tab?: string };
  Details: { id: string };
};

export type TestStackParamList = {
  HomeMenu: undefined;
  // App Shell Tests
  Lifecycle: undefined;
  Navigation: undefined;
  Stores: undefined;
  LoadingTest: undefined;
  ErrorTest: undefined;
  RemoteConfigTest: undefined;
  // Auth Lite Tests
  AnonymousTest: undefined;
  SocialSignIn: undefined;
  TokenManagement: undefined;
  AccountMigration: undefined;
  AccountManagement: undefined;
  AccountDeletion: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const TestStack = createNativeStackNavigator<TestStackParamList>();

export default function App() {
  const [deepLinkEvents, setDeepLinkEvents] = useState<string[]>([]);
  const [lifecycleEvents, setLifecycleEvents] = useState<string[]>([]);

  const handleDeepLink = (url: string, path: string) => {
    console.log('[Deep Link] Opened:', url);
    setDeepLinkEvents(prev => [...prev, `${url} (path: ${path})`]);
  };

  const addLifecycleEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLifecycleEvents(prev => [`[${timestamp}] ${event}`, ...prev].slice(0, 10));
  };

  return (
    <AdapterProvider>
      <AdapterRegistration />
      <RemoteConfigProvider
        config={{
        defaults: {
          feature_dark_mode: 'false',
          feature_premium: 'false',
          feature_experiment: 'false',
          api_timeout: '30000',
          api_url: 'https://api.example.com',
          enable_logging: 'false',
          max_retries: '3',
        },
        minimumFetchIntervalMillis: 3600000, // 1 hour
        fetchTimeoutMillis: 60000, // 60 seconds
        enableRealtime: false, // Set to true to test real-time updates
        onFetchSuccess: (config) => {
          console.log('[RemoteConfig] Fetch successful from:', config.source);
        },
        onFetchError: (error) => {
          console.log('[RemoteConfig] Fetch failed:', error.message);
        },
      }}
    >
      <LoadingProvider
        config={{
          splashMinDuration: 1000,
          tasks: [
            {
              id: 'init-stores',
              name: 'Initialize Stores',
              critical: true,
              executor: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log('[Loading] Stores initialized');
              },
            },
            {
              id: 'load-config',
              name: 'Load Configuration',
              critical: false,
              executor: async () => {
                await new Promise(resolve => setTimeout(resolve, 300));
                console.log('[Loading] Configuration loaded');
              },
            },
          ],
          onReady: () => {
            console.log('[Loading] App ready!');
          },
        }}
      >
      <LifecycleProvider 
        config={{
          coldStartThreshold: 300000,
          onAppStarting: () => {
            console.log('[Lifecycle] App starting');
            addLifecycleEvent('Config: onAppStarting fired');
          },
          onAppActive: () => {
            console.log('[Lifecycle] App active');
            addLifecycleEvent('Config: onAppActive fired');
          },
          onAppBackground: () => {
            console.log('[Lifecycle] App background');
            addLifecycleEvent('Config: onAppBackground fired');
          },
          onAppInactive: () => {
            console.log('[Lifecycle] App inactive');
            addLifecycleEvent('Config: onAppInactive fired');
          },
        }}
      >
        <StoreInitializer 
          config={{
            theme: {
              defaultMode: 'auto',
              followSystem: true,
            }
          }}
        >
          <AppWithErrorBoundary
            deepLinkEvents={deepLinkEvents} 
            lifecycleEvents={lifecycleEvents}
            handleDeepLink={handleDeepLink} 
          />
        </StoreInitializer>
      </LifecycleProvider>
    </LoadingProvider>
    </RemoteConfigProvider>
    </AdapterProvider>
  );
}

function AdapterRegistration() {
  const register = useAdapterRegistry((state) => state.register);

  useEffect(() => {
    console.log('[App] Registering adapter:', factoryTestAdapter.name);
    const result = register(factoryTestAdapter);
    
    if (!result.isValid) {
      console.error('[App] Adapter validation failed:', result.errors);
    } else if (result.warnings && result.warnings.length > 0) {
      console.warn('[App] Adapter validation warnings:', result.warnings);
    } else {
      console.log('[App] Adapter registered successfully');
    }
  }, [register]);

  return null;
}

function AppWithErrorBoundary({ 
  deepLinkEvents, 
  lifecycleEvents,
  handleDeepLink 
}: { 
  deepLinkEvents: string[];
  lifecycleEvents: string[];
  handleDeepLink: (url: string, path: string) => void;
}) {
  const isDarkMode = useIsDarkMode();

  return (
    <ErrorBoundary
      sentry={{
        dsn: 'https://fe1eaea9dfb0a13be984f388a8c8e970@o4510932248428544.ingest.de.sentry.io/4510932254326864',
        environment: __DEV__ ? 'development' : 'production',
        enabled: true,
      }}
      showDetailedError={__DEV__}
      isDarkMode={isDarkMode}
      onError={(error, errorInfo) => {
        console.error('[App] Error caught by boundary:', error.message);
      }}
      onReset={() => {
        console.log('[App] Error boundary reset');
      }}
    >
      <AppNavigator 
        deepLinkEvents={deepLinkEvents} 
        lifecycleEvents={lifecycleEvents}
        handleDeepLink={handleDeepLink} 
      />
    </ErrorBoundary>
  );
}

function AppNavigator({ 
  deepLinkEvents, 
  lifecycleEvents,
  handleDeepLink 
}: { 
  deepLinkEvents: string[];
  lifecycleEvents: string[];
  handleDeepLink: (url: string, path: string) => void;
}) {
  const isDarkMode = useIsDarkMode();

  const theme = useMemo(() => ({
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
  }), [isDarkMode]);

  return (
    <NavigationContainer
      theme={theme}
      config={{
          linking: {
            prefixes: ['factorytest://', 'https://factory-test.app'],
            screens: {
              Home: '',
              Profile: 'profile/:userId',
              Settings: 'settings',
              Details: 'details/:id',
            },
          },
        onDeepLink: handleDeepLink,
      }}
      onReady={() => console.log('[Navigation] Ready')}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          animation: 'simple_push',
          contentStyle: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          },
          headerStyle: {
            backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
          },
          headerTintColor: isDarkMode ? '#fff' : '#000',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          options={{ title: 'Factory Test App', headerShown: false }}
        >
          {() => <TestNavigator />}
        </Stack.Screen>
        <Stack.Screen name="Profile" component={ProfileScreenWrapper} options={{ title: 'Profile' }} />
        <Stack.Screen name="Settings" component={SettingsScreenWrapper} options={{ title: 'Settings' }} />
        <Stack.Screen name="Details" component={DetailsScreenWrapper} options={{ title: 'Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TestNavigator() {
  const isDarkMode = useIsDarkMode();

  return (
    <TestStack.Navigator
      initialRouteName="HomeMenu"
      screenOptions={{
        headerShown: true,
        animation: 'simple_push',
        contentStyle: {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        },
        headerStyle: {
          backgroundColor: isDarkMode ? '#2d2d2d' : '#fff',
        },
        headerTintColor: isDarkMode ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <TestStack.Screen 
        name="HomeMenu" 
        component={HomeMenuScreen} 
        options={{ headerShown: false }}
      />
      {/* App Shell Tests */}
      <TestStack.Screen name="Lifecycle" component={LifecycleScreen} options={{ title: 'Lifecycle & Events' }} />
      <TestStack.Screen name="Navigation" component={NavigationTestScreen} options={{ title: 'Navigation' }} />
      <TestStack.Screen name="Stores" component={StoresScreen} options={{ title: 'Theme & Stores' }} />
      <TestStack.Screen name="LoadingTest" component={LoadingTestScreen} options={{ title: 'Loading' }} />
      <TestStack.Screen name="ErrorTest" component={ErrorTestScreen} options={{ title: 'Error Handling' }} />
      <TestStack.Screen name="RemoteConfigTest" component={RemoteConfigTestScreen} options={{ title: 'Remote Config' }} />
      {/* Auth Lite Tests */}
      <TestStack.Screen name="AnonymousTest" component={AnonymousTestScreen} options={{ title: 'Anonymous Mode' }} />
      <TestStack.Screen name="SocialSignIn" component={SocialSignIn} options={{ title: 'Social Sign-In' }} />
      <TestStack.Screen name="TokenManagement" component={TokenManagement} options={{ title: 'Token Management' }} />
      <TestStack.Screen name="AccountMigration" component={AccountMigration} options={{ title: 'Account Migration' }} />
      <TestStack.Screen name="AccountManagement" component={AccountManagement} options={{ title: 'Account Management' }} />
      <TestStack.Screen name="AccountDeletion" component={AccountDeletion} options={{ title: 'Account Deletion' }} />
    </TestStack.Navigator>
  );
}

function HomeScreen({ deepLinkEvents, lifecycleEvents }: { 
  deepLinkEvents: string[];
  lifecycleEvents: string[];
}) {
  return <HomeMenuScreen />;
}

function ProfileScreenWrapper() {
  const isDarkMode = useIsDarkMode();
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';
  
  return (
    <ProfileScreen 
      isDarkMode={isDarkMode}
      textColor={textColor}
      secondaryText={secondaryText}
    />
  );
}

function SettingsScreenWrapper() {
  const isDarkMode = useIsDarkMode();
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';
  
  return (
    <SettingsScreen 
      isDarkMode={isDarkMode}
      textColor={textColor}
      secondaryText={secondaryText}
    />
  );
}

function DetailsScreenWrapper() {
  const isDarkMode = useIsDarkMode();
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';
  
  return (
    <DetailsScreen 
      isDarkMode={isDarkMode}
      textColor={textColor}
      secondaryText={secondaryText}
    />
  );
}

function AppContent({ deepLinkEvents, lifecycleEvents }: { 
  deepLinkEvents: string[];
  lifecycleEvents: string[];
}) {
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

        {/* Config-Based API Demo */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            ✨ Config-Based API (NEW)
          </Text>
          <Text style={[styles.instructions, { color: secondaryText }]}>
            This app now uses config-based initialization for all features:{'\n\n'}
            • LifecycleProvider with event callbacks{'\n'}
            • StoreInitializer with theme config{'\n'}
            • NavigationContainer with deep links{'\n\n'}
            See App.tsx for implementation details.
          </Text>
        </View>

        {/* Lifecycle Events from Config */}
        {lifecycleEvents.length > 0 && (
          <View style={[styles.section, { backgroundColor: cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Lifecycle Config Events
            </Text>
            {lifecycleEvents.map((event, idx) => (
              <Text key={idx} style={[styles.eventItem, { color: secondaryText }]}>
                {event}
              </Text>
            ))}
          </View>
        )}
        
        <Navigation 
          onEvent={addEvent}
          deepLinkEvents={deepLinkEvents}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

        <Adapter />

        <Anonymous />

        <SocialSignIn />

        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Token Management
          </Text>
          <TokenManagement />
        </View>

        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Account Migration
          </Text>
          <AccountMigration />
        </View>

        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Account Management
          </Text>
          <AccountManagement />
        </View>

        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Account Deletion
          </Text>
          <AccountDeletion />
        </View>

        <Errors
          onEvent={addEvent}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

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

        <Loading 
          onEvent={addEvent}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

        <RemoteConfig />

        <EventLog 
          events={events}
          onClear={clearEvents}
          isDarkMode={isDarkMode}
          cardBackground={cardBackground}
          textColor={textColor}
          secondaryText={secondaryText}
        />

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
  eventItem: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
