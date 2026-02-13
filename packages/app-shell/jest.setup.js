// Jest setup file - Runs before each test file
// Official docs: https://jestjs.io/docs/configuration#setupfilesafterenv-array

global.__DEV__ = true;

// Import Zustand reset utility
const { resetAllStores } = require('./__mocks__/zustand');

// Reset all Zustand stores before each test
beforeEach(() => {
  resetAllStores();
});

// Silence console logs in tests for cleaner output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
