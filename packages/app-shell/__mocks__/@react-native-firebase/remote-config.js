// Mock for @react-native-firebase/remote-config
const remoteConfig = jest.fn(() => ({
  setDefaults: jest.fn(),
  setConfigSettings: jest.fn(),
  activate: jest.fn(),
  fetchAndActivate: jest.fn(),
  fetch: jest.fn(),
  getAll: jest.fn(),
  getValue: jest.fn(),
  getString: jest.fn(),
  getNumber: jest.fn(),
  getBoolean: jest.fn(),
  onConfigUpdated: jest.fn(),
}));

export default remoteConfig;
