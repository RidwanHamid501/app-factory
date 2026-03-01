import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAdapterConfig } from '@factory/app-shell';
import {
  useRevenueCatInitialization,
  useCustomerInfo,
  useEntitlement,
  useOfferings,
  useRestorePurchases,
  usePaywall,
} from '@factory/paywall';

interface PaywallProps {
  isDarkMode: boolean;
  cardBackground: string;
  textColor: string;
  secondaryText: string;
}

export function Paywall({ isDarkMode, cardBackground, textColor, secondaryText }: PaywallProps) {
  const config = useAdapterConfig();
  const apiKey = (config as any)?.paywall?.apiKey || 'test_qsBndNsiLiFDMLTOlDqFpGwPjdn';
  const entitlementId = (config as any)?.paywall?.entitlementId || 'pro';
  
  const { isInitialized, error: initError } = useRevenueCatInitialization(apiKey);
  const { customerInfo, isLoading: customerLoading } = useCustomerInfo();
  const { hasEntitlement: isPro } = useEntitlement(entitlementId);
  const { currentOffering, isLoading: offeringsLoading } = useOfferings();
  const { restore, isRestoring } = useRestorePurchases();
  const { present: presentPaywall } = usePaywall();

  const activeEntitlements = customerInfo?.entitlements.active || {};
  const hasActiveSubscription = Object.keys(activeEntitlements).length > 0;

  const handleShowPaywall = async () => {
    try {
      const result = await presentPaywall();
      if (result === 'PURCHASED' || result === 'RESTORED') {
        Alert.alert('Success!', 'Welcome to Pro!');
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      Alert.alert('Error', error.message);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await restore();
      if (result.entitlementsRestored) {
        Alert.alert('Success', 'Purchases restored!');
      } else {
        Alert.alert('No Purchases Found', 'No previous purchases to restore.');
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>RevenueCat Paywall</Text>
      <Text style={[styles.info, { color: secondaryText }]}>
        ℹ️ Uses RevenueCat SDK (config-based initialization)
      </Text>

      {/* SDK Status */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>SDK Status:</Text>
        <Text style={[styles.value, { color: isInitialized ? '#10b981' : '#ef4444' }]}>
          {isInitialized ? '✅ Initialized' : initError ? '❌ Error' : '⏳ Loading...'}
        </Text>
      </View>

      {/* Subscription Status */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: secondaryText }]}>Subscription:</Text>
        <Text style={[styles.value, { color: isPro ? '#10b981' : '#94a3b8' }]}>
          {isPro ? '✅ Pro Member' : '🔒 Free User'}
        </Text>
      </View>

      {/* Active Entitlements */}
      {hasActiveSubscription && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: secondaryText }]}>Entitlements:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {Object.keys(activeEntitlements).join(', ')}
          </Text>
        </View>
      )}

      {/* Available Packages */}
      {currentOffering && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: secondaryText }]}>Packages:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {currentOffering.availablePackages.length} available
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!isPro && (
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleShowPaywall}
            disabled={!isInitialized}
          >
            <Text style={styles.buttonText}>Upgrade to Pro</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRestore}
          disabled={isRestoring || !isInitialized}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Restore Purchases</Text>
          )}
        </Pressable>
      </View>

      {/* Loading States */}
      {(customerLoading || offeringsLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={textColor} />
          <Text style={[styles.loadingText, { color: secondaryText }]}>Loading...</Text>
        </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
});
