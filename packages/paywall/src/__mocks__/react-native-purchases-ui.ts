// Mock for react-native-purchases-ui
export const PAYWALL_RESULT = {
  PURCHASED: 'PURCHASED',
  RESTORED: 'RESTORED',
  CANCELLED: 'CANCELLED',
};

const RevenueCatUI = {
  PAYWALL_RESULT,
  presentPaywall: jest.fn(),
  presentPaywallIfNeeded: jest.fn(),
  Paywall: 'Paywall',
};

export default RevenueCatUI;
