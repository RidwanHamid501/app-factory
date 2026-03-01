import { purchaseManager } from '../../purchase/PurchaseManager';
import Purchases from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';

jest.mock('react-native-purchases');

const mockPackage: PurchasesPackage = {
  identifier: 'monthly',
  offeringIdentifier: 'default',
  packageType: 'MONTHLY',
  product: {
    identifier: 'monthly_pro',
    description: 'Monthly Pro',
    title: 'Monthly Pro Subscription',
    price: 9.99,
    priceString: '$9.99',
    currencyCode: 'USD',
    introPrice: null,
  },
} as any;

const mockCustomerInfo = {
  entitlements: {
    active: {
      pro: { isActive: true },
    },
  },
} as any;

describe('PurchaseManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should purchase package successfully', async () => {
    (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
      customerInfo: mockCustomerInfo,
      productIdentifier: 'monthly_pro',
    });

    const result = await purchaseManager.purchasePackage(mockPackage);

    expect(Purchases.purchasePackage).toHaveBeenCalledWith(mockPackage);
    expect(result.customerInfo).toEqual(mockCustomerInfo);
    expect(result.productIdentifier).toBe('monthly_pro');
  });

  it('should handle purchase cancellation', async () => {
    (Purchases.purchasePackage as jest.Mock).mockRejectedValue({
      message: 'User cancelled',
      userCancelled: true,
    });

    await expect(purchaseManager.purchasePackage(mockPackage))
      .rejects
      .toMatchObject({ userCancelled: true });
  });

  it('should handle purchase errors', async () => {
    (Purchases.purchasePackage as jest.Mock).mockRejectedValue({
      message: 'Network error',
      userCancelled: false,
      code: 'NETWORK_ERROR',
    });

    await expect(purchaseManager.purchasePackage(mockPackage))
      .rejects
      .toMatchObject({
        message: 'Network error',
        code: 'NETWORK_ERROR',
      });
  });
});
