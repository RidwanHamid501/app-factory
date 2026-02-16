// Jest configuration for React Native with React 19 support
// Official docs: https://jestjs.io/docs/tutorial-react-native
// React 19 compatibility: https://callstack.github.io/react-native-testing-library/docs/guides/react-19

module.exports = {
  preset: 'react-native',
  
  // TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  
  // Transform React Native modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation)/)',
  ],
  
  // File extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Setup files - run before test environment is set up
  setupFiles: [
    '<rootDir>/jest.globals.js',
  ],
  
  // Setup files after environment - run after test environment is set up
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapper for aliases and mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Mock zustand for test isolation
  automock: false,
};
