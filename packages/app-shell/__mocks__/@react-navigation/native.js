// Mock @react-navigation/native for testing
module.exports = {
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  useNavigationState: jest.fn(() => ({})),
  getStateFromPath: jest.fn(),
  createNavigationContainerRef: () => ({
    current: null,
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    resetRoot: jest.fn(),
    canGoBack: jest.fn(() => true),
    getRootState: jest.fn(() => ({})),
    getCurrentRoute: jest.fn(() => ({ name: 'Home', params: {} })),
  }),
};
