// Define __DEV__ for tests
global.__DEV__ = true;

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  AppState: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));
