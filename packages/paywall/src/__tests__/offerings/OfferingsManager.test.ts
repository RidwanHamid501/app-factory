import { offeringsManager } from '../../offerings/OfferingsManager';
import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases');

const mockOfferings = {
  current: {
    identifier: 'default',
    serverDescription: 'Default offering',
    availablePackages: [],
    monthly: null,
    annual: null,
    lifetime: null,
  },
  all: {},
};

describe('OfferingsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    offeringsManager.clearCache();
  });

  it('should fetch offerings from RevenueCat', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);

    const result = await offeringsManager.getOfferings();

    expect(Purchases.getOfferings).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOfferings);
  });

  it('should cache offerings for 5 minutes', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);

    await offeringsManager.getOfferings();
    await offeringsManager.getOfferings();

    expect(Purchases.getOfferings).toHaveBeenCalledTimes(1);
  });

  it('should force refresh when requested', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);

    await offeringsManager.getOfferings();
    await offeringsManager.getOfferings(true);

    expect(Purchases.getOfferings).toHaveBeenCalledTimes(2);
  });

  it('should return current offering', async () => {
    (Purchases.getOfferings as jest.Mock).mockResolvedValue(mockOfferings);

    const current = await offeringsManager.getCurrentOffering();

    expect(current).toEqual(mockOfferings.current);
  });
});
