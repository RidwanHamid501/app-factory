import { paywallController } from '../../paywall/PaywallController';
import RevenueCatUI from 'react-native-purchases-ui';
import { PaywallResult } from '../../paywall/types';

jest.mock('react-native-purchases-ui');

describe('PaywallController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should present paywall if needed', async () => {
    (RevenueCatUI.presentPaywallIfNeeded as jest.Mock).mockResolvedValue(
      RevenueCatUI.PAYWALL_RESULT.PURCHASED
    );

    const result = await paywallController.presentPaywallIfNeeded('pro');

    expect(RevenueCatUI.presentPaywallIfNeeded).toHaveBeenCalledWith({
      requiredEntitlementIdentifier: 'pro',
    });
    expect(result).toBe(PaywallResult.PURCHASED);
  });

  it('should present paywall unconditionally', async () => {
    (RevenueCatUI.presentPaywall as jest.Mock).mockResolvedValue(
      RevenueCatUI.PAYWALL_RESULT.CANCELLED
    );

    const result = await paywallController.presentPaywall();

    expect(RevenueCatUI.presentPaywall).toHaveBeenCalledWith({});
    expect(result).toBe(PaywallResult.CANCELLED);
  });
});
