module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(expo-secure-store|expo-auth-session|expo-web-browser|expo-crypto|react-native|@react-native-async-storage)/)',
  ],
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
  ],
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],

  setupFiles: ['<rootDir>/jest.setup.js'],
  
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/src/__mocks__/expo-secure-store.ts',
    '^expo-auth-session$': '<rootDir>/src/__mocks__/expo-auth-session.ts',
    '^expo-web-browser$': '<rootDir>/src/__mocks__/expo-web-browser.ts',
    '^expo-crypto$': '<rootDir>/src/__mocks__/expo-crypto.ts',
  },
};
