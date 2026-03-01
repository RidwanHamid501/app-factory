import { restoreManager } from '../../restore/RestoreManager';
import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases');

const mockCustomerInfo = {
  entitlements: {
    active: {
      pro: { isActive: true },
    },
  },
} as any;

const mockEmptyCustomerInfo = {
  entitlements: {
    active: {},
  },
} as any;

describe('RestoreManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should restore purchases successfully', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const result = await restoreManager.restorePurchases();

    expect(Purchases.restorePurchases).toHaveBeenCalledTimes(1);
    expect(result.customerInfo).toEqual(mockCustomerInfo);
    expect(result.entitlementsRestored).toBe(true);
  });

  it('should detect no purchases to restore', async () => {
    (Purchases.restorePurchases as jest.Mock).mockResolvedValue(mockEmptyCustomerInfo);

    const result = await restoreManager.restorePurchases();

    expect(result.entitlementsRestored).toBe(false);
  });

  it('should sync purchases programmatically', async () => {
    (Purchases.syncPurchases as jest.Mock).mockResolvedValue(undefined);
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const result = await restoreManager.syncPurchases();

    expect(Purchases.syncPurchases).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCustomerInfo);
  });

  it('should handle restore errors', async () => {
    (Purchases.restorePurchases as jest.Mock).mockRejectedValue({
      message: 'Network error',
      code: 'NETWORK_ERROR',
    });

    await expect(restoreManager.restorePurchases())
      .rejects
      .toMatchObject({
        message: 'Network error',
        code: 'NETWORK_ERROR',
      });
  });
});
