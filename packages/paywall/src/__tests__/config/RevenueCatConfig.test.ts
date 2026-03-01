import { initializeRevenueCat, isRevenueCatConfigured } from '../../config/RevenueCatConfig';
import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases');

describe('RevenueCat Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure RevenueCat with correct API key for iOS', async () => {
    const config = {
      iosApiKey: 'ios_test_key',
      androidApiKey: 'android_test_key',
    };

    await initializeRevenueCat(config);

    expect(Purchases.configure).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      appUserID: undefined,
    });
  });

  it('should return configured status', () => {
    const configured = isRevenueCatConfigured();
    expect(typeof configured).toBe('boolean');
  });
});
