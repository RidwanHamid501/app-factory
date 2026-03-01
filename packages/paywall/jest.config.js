module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-purchases|react-native-purchases-ui|@react-native-async-storage)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native-purchases$': '<rootDir>/src/__mocks__/react-native-purchases.ts',
    '^react-native-purchases-ui$': '<rootDir>/src/__mocks__/react-native-purchases-ui.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/__mocks__/async-storage.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/__mocks__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
  ],
};
