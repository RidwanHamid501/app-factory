import { customerInfoManager } from '../../entitlements/CustomerInfoManager';
import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases');

const mockCustomerInfo = {
  entitlements: {
    active: {
      pro: {
        identifier: 'pro',
        isActive: true,
        willRenew: true,
        periodType: 'NORMAL',
        expirationDate: null,
        billingIssueDetectedAt: null,
        productIdentifier: 'monthly_pro',
      },
    },
    all: {},
  },
};

describe('CustomerInfoManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    customerInfoManager.clearCache();
  });

  it('should fetch customer info from RevenueCat', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const result = await customerInfoManager.getCustomerInfo();

    expect(Purchases.getCustomerInfo).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCustomerInfo);
  });

  it('should detect active entitlement', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const hasAccess = await customerInfoManager.hasEntitlement('pro');

    expect(hasAccess).toBe(true);
  });

  it('should return false for missing entitlement', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const hasAccess = await customerInfoManager.hasEntitlement('premium');

    expect(hasAccess).toBe(false);
  });

  it('should cache customer info for 5 minutes', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    await customerInfoManager.getCustomerInfo();
    await customerInfoManager.getCustomerInfo();

    expect(Purchases.getCustomerInfo).toHaveBeenCalledTimes(1);
  });
});
