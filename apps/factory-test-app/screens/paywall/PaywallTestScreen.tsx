import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useIsDarkMode, useAdapterConfig } from '@factory/app-shell';
import {
  useRevenueCatInitialization,
  useOfferings,
  useCurrentOffering,
  useCustomerInfo,
  useEntitlement,
  usePurchase,
  useRestorePurchases,
  usePaywall,
  type PurchasesPackage,
} from '@factory/paywall';

export function PaywallTestScreen() {
  const isDarkMode = useIsDarkMode();
  const [testResults, setTestResults] = useState<Record<string, { pass: boolean; message: string }>>({});

  const bgColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBg = isDarkMode ? '#2d2d2d' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryText = isDarkMode ? '#aaa' : '#666';
  const borderColor = isDarkMode ? '#444' : '#e0e0e0';

  const addTestResult = (key: string, pass: boolean, message: string) => {
    setTestResults(prev => ({ ...prev, [key]: { pass, message } }));
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: textColor }]}>
          @factory/paywall Integration Test
        </Text>

        <SDKStatusCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
        />

        <OfferingsCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
          onTestResult={addTestResult}
        />

        <EntitlementsCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
          onTestResult={addTestResult}
        />

        <PurchaseCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
          onTestResult={addTestResult}
        />

        <RestoreCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
          onTestResult={addTestResult}
        />

        <SubscriptionStatusCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
        />

        <FeatureGateCard 
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
        />

        <TestResultsCard
          testResults={testResults}
          isDarkMode={isDarkMode}
          cardBg={cardBg}
          textColor={textColor}
          secondaryText={secondaryText}
          borderColor={borderColor}
        />
      </ScrollView>
    </View>
  );
}

function SDKStatusCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor }: any) {
  const config = useAdapterConfig();
  const apiKey = (config as any)?.paywall?.apiKey || 'test_qsBndNsiLiFDMLTOlDqFpGwPjdn';
  const { isInitialized, error } = useRevenueCatInitialization(apiKey);

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>1️⃣ SDK Status</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isInitialized ? '#10b981' : error ? '#ef4444' : '#fbbf24' }]} />
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: secondaryText }]}>Status:</Text>
        <Text style={[styles.infoValue, { color: textColor }]}>
          {isInitialized ? '✅ Initialized' : error ? '❌ Error' : '⏳ Initializing...'}
        </Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }]}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
            {error}
          </Text>
        </View>
      )}

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: SDK should initialize automatically on app launch. Check console for initialization logs.
      </Text>
    </View>
  );
}

function OfferingsCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor, onTestResult }: any) {
  const { offerings, currentOffering, isLoading, error, refetch } = useOfferings();
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [isCached, setIsCached] = useState(false);

  const handleFetch = async () => {
    const startTime = Date.now();
    setLastFetchTime(new Date());
    await refetch();
    const endTime = Date.now();
    const fetchDuration = endTime - startTime;
    
    // If fetch was very fast (< 100ms), likely from cache
    setIsCached(fetchDuration < 100);
    setFetchCount(prev => prev + 1);
    
    if (offerings && currentOffering) {
      onTestResult('offerings', true, `Successfully fetched offerings${isCached ? ' (cached)' : ''}`);
    } else if (error) {
      onTestResult('offerings', false, error.message);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>2️⃣ Offerings & Packages</Text>
        <View style={[styles.statusIndicator, { backgroundColor: offerings ? '#10b981' : error ? '#ef4444' : '#94a3b8' }]} />
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: '#3b82f6' }]}
        onPress={handleFetch}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Fetch Offerings</Text>
        )}
      </Pressable>

      {lastFetchTime && (
        <View style={styles.cacheInfoContainer}>
          <Text style={[styles.timestamp, { color: secondaryText }]}>
            Last fetch: {lastFetchTime.toLocaleTimeString()} (Attempt #{fetchCount})
          </Text>
          {fetchCount > 1 && (
            <View style={[styles.cacheIndicator, { backgroundColor: isCached ? '#dcfce7' : '#dbeafe' }]}>
              <Text style={[styles.cacheText, { color: isCached ? '#166534' : '#1e40af' }]}>
                {isCached ? '📦 From Cache' : '🌐 From Network'}
              </Text>
            </View>
          )}
        </View>
      )}

      {currentOffering && (
        <>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Current Offering:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{currentOffering.identifier}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: textColor }]}>Available Packages:</Text>
          {currentOffering.availablePackages.map((pkg: PurchasesPackage, idx: number) => (
            <View key={idx} style={[styles.packageBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderColor }]}>
              <Text style={[styles.packageType, { color: textColor }]}>
                {pkg.packageType.toUpperCase()}
              </Text>
              <Text style={[styles.packagePrice, { color: '#3b82f6' }]}>
                {pkg.product.priceString}
              </Text>
              <Text style={[styles.packageId, { color: secondaryText }]}>
                {pkg.product.identifier}
              </Text>
            </View>
          ))}
        </>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }]}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
            {error.message}
          </Text>
        </View>
      )}

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Should fetch and display offerings from RevenueCat with localized pricing. Second fetch should be faster (cached).
      </Text>
    </View>
  );
}

function EntitlementsCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor, onTestResult }: any) {
  const config = useAdapterConfig();
  const entitlementId = (config as any)?.paywall?.entitlementId || 'pro';
  const { customerInfo, isLoading, error, refetch } = useCustomerInfo();
  const { hasEntitlement: hasPro, isLoading: checkingPro } = useEntitlement(entitlementId);

  const handleCheck = async () => {
    await refetch();
    if (customerInfo) {
      onTestResult('entitlements', true, `Entitlement check completed. Has '${entitlementId}': ${hasPro}`);
    }
  };

  const activeEntitlements = customerInfo?.entitlements.active || {};
  const hasAnyEntitlement = Object.keys(activeEntitlements).length > 0;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>3️⃣ Entitlements</Text>
        <View style={[styles.statusIndicator, { backgroundColor: hasAnyEntitlement ? '#10b981' : '#94a3b8' }]} />
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: '#8b5cf6' }]}
        onPress={handleCheck}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Check Entitlements</Text>
        )}
      </Pressable>

      {customerInfo && (
        <>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Has 'pro' Entitlement:</Text>
            <Text style={[styles.infoValue, { color: hasPro ? '#10b981' : '#ef4444' }]}>
              {hasPro ? '✅ Yes' : '❌ No'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Active Entitlements:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {Object.keys(activeEntitlements).length > 0 
                ? Object.keys(activeEntitlements).join(', ')
                : 'None'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Subscription Status:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {hasAnyEntitlement ? 'Subscribed' : 'Not Subscribed'}
            </Text>
          </View>
        </>
      )}

      {error && (
        <View style={[styles.errorBox, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }]}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
            {error.message}
          </Text>
        </View>
      )}

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Shows current entitlement status. Should update after purchases.
      </Text>
    </View>
  );
}

function PurchaseCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor, onTestResult }: any) {
  const { present: presentPaywall } = usePaywall();
  const [presenting, setPresenting] = useState(false);

  const handleShowPaywall = async () => {
    setPresenting(true);
    try {
      const result = await presentPaywall();
      if (result === 'PURCHASED' || result === 'RESTORED') {
        Alert.alert('Success!', 'Purchase completed successfully');
        onTestResult('purchase', true, 'Purchase successful');
      } else if (result === 'CANCELLED') {
        Alert.alert('Cancelled', 'Purchase was cancelled');
        onTestResult('purchase', true, 'Purchase cancelled by user');
      } else if (result === 'ERROR') {
        Alert.alert('Error', 'An error occurred during purchase');
        onTestResult('purchase', false, 'Purchase error');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
      onTestResult('purchase', false, err.message);
    } finally {
      setPresenting(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>4️⃣ Purchase Flow</Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: '#10b981' }]}
        onPress={handleShowPaywall}
        disabled={presenting}
      >
        {presenting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Show Paywall</Text>
        )}
      </Pressable>

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Opens RevenueCat Paywall UI. Complete purchase using sandbox/test account. Check console for purchase events.
      </Text>

      <View style={[styles.warningBox, { backgroundColor: isDarkMode ? '#78350f' : '#fef3c7' }]}>
        <Text style={[styles.warningText, { color: isDarkMode ? '#fcd34d' : '#92400e' }]}>
          ⚠️ Use Sandbox (iOS) or Test Account (Android) only. Ensure you're signed in with test credentials.
        </Text>
      </View>
    </View>
  );
}

function RestoreCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor, onTestResult }: any) {
  const { restore, loading, error } = useRestorePurchases();

  const handleRestore = async () => {
    try {
      const result = await restore();
      
      if (result.restored) {
        Alert.alert('Success!', 'Your purchases have been restored!');
        onTestResult('restore', true, 'Purchases restored successfully');
      } else {
        Alert.alert('No Purchases Found', "We couldn't find any previous purchases associated with your account.");
        onTestResult('restore', true, 'No purchases to restore');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to restore purchases');
      onTestResult('restore', false, err.message);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>5️⃣ Purchase Restoration</Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: '#f59e0b' }]}
        onPress={handleRestore}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Restore Purchases</Text>
        )}
      </Pressable>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: isDarkMode ? '#7f1d1d' : '#fee2e2' }]}>
          <Text style={[styles.errorText, { color: isDarkMode ? '#fca5a5' : '#dc2626' }]}>
            {error}
          </Text>
        </View>
      )}

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Restores previous purchases. Required by Apple App Store guidelines. Test after uninstall/reinstall.
      </Text>
    </View>
  );
}

function SubscriptionStatusCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor }: any) {
  const { customerInfo, refetch } = useCustomerInfo();

  const activeEntitlements = customerInfo?.entitlements.active || {};
  const firstEntitlement = Object.values(activeEntitlements)[0];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>6️⃣ Subscription Status</Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: '#6366f1' }]}
        onPress={refetch}
      >
        <Text style={styles.buttonText}>Refresh Status</Text>
      </Pressable>

      {firstEntitlement ? (
        <>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Status:</Text>
            <Text style={[styles.infoValue, { color: '#10b981' }]}>Active</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Product ID:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{firstEntitlement.productIdentifier}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Will Renew:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {firstEntitlement.willRenew ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Expiration:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {firstEntitlement.expirationDate 
                ? new Date(firstEntitlement.expirationDate).toLocaleString()
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: secondaryText }]}>Period Type:</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>{firstEntitlement.periodType}</Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#065f46' : '#d1fae5', borderColor }]}>
            <Text style={[styles.infoBoxText, { color: isDarkMode ? '#6ee7b7' : '#065f46' }]}>
              ℹ️ Sandbox subscriptions expire quickly (5 min for monthly). This is normal for testing.
            </Text>
          </View>
        </>
      ) : (
        <Text style={[styles.noDataText, { color: secondaryText }]}>
          No active subscription. Complete a purchase to see details here.
        </Text>
      )}

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Displays active subscription details including expiration date and renewal status.
      </Text>
    </View>
  );
}

function FeatureGateCard({ isDarkMode, cardBg, textColor, secondaryText, borderColor }: any) {
  const config = useAdapterConfig();
  const entitlementId = (config as any)?.paywall?.entitlementId || 'pro';
  const { hasEntitlement: hasPro } = useEntitlement(entitlementId);
  const { presentPaywall } = usePaywall();

  const handleAccessFeature = async () => {
    if (hasPro) {
      Alert.alert('Premium Feature Unlocked!', 'You have access to this premium feature.');
    } else {
      Alert.alert('Premium Required', 'This feature requires a subscription.');
      await presentPaywall();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>7️⃣ Feature Gate</Text>
        <View style={[styles.statusIndicator, { backgroundColor: hasPro ? '#10b981' : '#ef4444' }]} />
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: hasPro ? '#10b981' : '#6b7280' }]}
        onPress={handleAccessFeature}
      >
        <Text style={styles.buttonText}>
          {hasPro ? '✅ Access Premium Feature' : '🔒 Access Premium Feature'}
        </Text>
      </Pressable>

      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: secondaryText }]}>Access Status:</Text>
        <Text style={[styles.infoValue, { color: hasPro ? '#10b981' : '#ef4444' }]}>
          {hasPro ? 'Unlocked' : 'Locked'}
        </Text>
      </View>

      <Text style={[styles.instructions, { color: secondaryText }]}>
        Expected: Button is locked if no subscription. Unlocks immediately after successful purchase.
      </Text>
    </View>
  );
}

function TestResultsCard({ testResults, isDarkMode, cardBg, textColor, secondaryText, borderColor }: any) {
  const resultsArray = Object.entries(testResults);
  
  if (resultsArray.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <Text style={[styles.cardTitle, { color: textColor }]}>Test Results</Text>
      
      {resultsArray.map(([key, result]: [string, any]) => (
        <View key={key} style={styles.resultRow}>
          <Text style={{ color: result.pass ? '#10b981' : '#ef4444', fontSize: 20 }}>
            {result.pass ? '✓' : '✗'}
          </Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.resultKey, { color: textColor }]}>{key}</Text>
            <Text style={[styles.resultMessage, { color: secondaryText }]}>{result.message}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  packageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  packageType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  packageId: {
    fontSize: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  cacheInfoContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  cacheIndicator: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cacheText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
  },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
  },
  infoBoxText: {
    fontSize: 13,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  resultKey: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  resultMessage: {
    fontSize: 13,
    marginTop: 2,
  },
});
