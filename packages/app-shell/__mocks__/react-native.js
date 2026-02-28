// Mock React Native for testing
module.exports = {
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator',
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  useColorScheme: jest.fn(() => 'light'),
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
};
