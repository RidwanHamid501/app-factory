import {
  initialize,
  fetchAndActivate,
  enableRealtime,
  disableRealtime,
  __resetManagerForTesting,
} from '../RemoteConfigManager';

// Mock Logger
jest.mock('../../utils/logger', () => ({
  Logger: {
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Firebase Remote Config modular API
const mockGetRemoteConfig = jest.fn();
const mockSetDefaults = jest.fn();
const mockSetConfigSettings = jest.fn();
const mockActivate = jest.fn();
const mockFetchAndActivate = jest.fn();
const mockGetAll = jest.fn();
const mockOnConfigUpdated = jest.fn();

jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: mockGetRemoteConfig,
  setDefaults: mockSetDefaults,
  setConfigSettings: mockSetConfigSettings,
  activate: mockActivate,
  fetchAndActivate: mockFetchAndActivate,
  getAll: mockGetAll,
  onConfigUpdated: mockOnConfigUpdated,
}));

describe('RemoteConfigManager', () => {
  let mockRemoteConfigInstance: Record<string, unknown>;

  beforeEach(() => {
    jest.clearAllMocks();
    __resetManagerForTesting();

    // Setup mock Remote Config instance
    mockRemoteConfigInstance = {};
    
    mockGetRemoteConfig.mockReturnValue(mockRemoteConfigInstance);
    mockSetDefaults.mockResolvedValue(undefined);
    mockSetConfigSettings.mockResolvedValue(undefined);
    mockActivate.mockResolvedValue(true);
    mockFetchAndActivate.mockResolvedValue(true);
    mockGetAll.mockReturnValue({});
    mockOnConfigUpdated.mockReturnValue(jest.fn());
  });

  describe('initialize', () => {
    it('✅ initializes with defaults when Firebase unavailable', async () => {
      __resetManagerForTesting();
      mockGetRemoteConfig.mockReturnValueOnce(null);

      const config = { defaults: { test_key: 'default_value' } };
      const result = await initialize(config);

      expect(result.source).toBe('default');
      expect(result.values).toEqual({ test_key: 'default_value' });
      expect(result.lastFetchStatus).toBe('no-fetch-yet');
    });

    it('✅ initializes successfully with Firebase', async () => {
      const config = { defaults: { test_key: 'default_value' } };

      mockGetAll.mockReturnValue({
        test_key: {
          asString: () => 'cached_value',
          getSource: () => 'remote', // Simulate Firebase having cached remote values
        },
      });

      const result = await initialize(config);

      expect(mockSetDefaults).toHaveBeenCalledWith(mockRemoteConfigInstance, config.defaults);
      expect(mockSetConfigSettings).toHaveBeenCalled();
      expect(mockActivate).toHaveBeenCalledWith(mockRemoteConfigInstance);
      expect(result.source).toBe('cache');
    });

    it('❌ handles initialization failure', async () => {
      const error = new Error('Init failed');
      mockSetDefaults.mockRejectedValueOnce(error);

      const config = { defaults: { test_key: 'default_value' } };
      const result = await initialize(config);

      expect(result.source).toBe('default');
      expect(result.lastFetchStatus).toBe('failure');
      expect(result.values).toEqual({ test_key: 'default_value' });
    });

    it('✅ sets correct fetch settings', async () => {
      mockGetAll.mockReturnValue({});

      const config = {
        defaults: {},
        fetchTimeoutMillis: 30000,
        minimumFetchIntervalMillis: 1800000,
      };

      await initialize(config);

      expect(mockSetConfigSettings).toHaveBeenCalledWith(mockRemoteConfigInstance, {
        fetchTimeoutMillis: 30000,
        minimumFetchIntervalMillis: 1800000,
      });
    });
  });

  describe('fetchAndActivate', () => {
    it('✅ successfully fetches and activates remote config', async () => {
      mockGetAll.mockReturnValue({
        feature_test: {
          asString: () => 'true',
          getSource: () => 'remote',
        },
      });

      const config = {
        onFetchSuccess: jest.fn(),
        onActivate: jest.fn(),
      };

      const result = await fetchAndActivate(config);

      expect(mockFetchAndActivate).toHaveBeenCalledWith(mockRemoteConfigInstance);
      expect(result.source).toBe('remote');
      expect(result.lastFetchStatus).toBe('success');
      expect(config.onFetchSuccess).toHaveBeenCalledWith(result);
      expect(config.onActivate).toHaveBeenCalledWith(result);
    });

    it('❌ handles fetch failure', async () => {
      const error = new Error('Fetch failed');
      mockFetchAndActivate.mockRejectedValueOnce(error);

      const config = {
        defaults: { default_key: 'default' },
      };

      const result = await fetchAndActivate(config);

      expect(result.source).toBe('default');
      expect(result.lastFetchStatus).toBe('failure');
    });

    it('❌ calls error callback on fetch failure', async () => {
      const error = new Error('Network error');
      mockFetchAndActivate.mockRejectedValueOnce(error);

      const config = {
        defaults: {},
        onFetchError: jest.fn(),
      };

      await fetchAndActivate(config);

      expect(config.onFetchError).toHaveBeenCalledWith(error);
    });

    it('✅ calls callbacks on successful fetch', async () => {
      mockGetAll.mockReturnValue({});

      const config = {
        onFetchSuccess: jest.fn(),
        onActivate: jest.fn(),
      };

      await fetchAndActivate(config);

      expect(config.onFetchSuccess).toHaveBeenCalledTimes(1);
      expect(config.onActivate).toHaveBeenCalledTimes(1);
    });
  });

  describe('enableRealtime', () => {
    it('✅ enables real-time updates correctly', () => {
      const onUpdate = jest.fn();
      const config = { onActivate: jest.fn() };

      enableRealtime(config, onUpdate);

      expect(mockOnConfigUpdated).toHaveBeenCalledWith(mockRemoteConfigInstance, expect.any(Function));
    });

    it('✅ real-time listener activates updates', async () => {
      const onUpdate = jest.fn();
      const config = { onActivate: jest.fn() };
      
      let realtimeCallback: () => void;
      mockOnConfigUpdated.mockImplementation((_instance: unknown, callback: () => void) => {
        realtimeCallback = callback;
        return jest.fn(); // Return unsubscribe function
      });

      mockGetAll.mockReturnValue({
        updated_key: { asString: () => 'updated_value', getSource: () => 'remote' },
      });

      enableRealtime(config, onUpdate);

      // Trigger the real-time callback
      await realtimeCallback!();

      expect(mockActivate).toHaveBeenCalledWith(mockRemoteConfigInstance);
      expect(onUpdate).toHaveBeenCalled();
      expect(config.onActivate).toHaveBeenCalled();
    });
  });

  describe('disableRealtime', () => {
    it('✅ disables real-time updates correctly', () => {
      const unsubscribe = jest.fn();
      mockOnConfigUpdated.mockReturnValue(unsubscribe);

      const onUpdate = jest.fn();
      enableRealtime({}, onUpdate);
      disableRealtime();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('✅ handles multiple enable/disable cycles', () => {
      const unsubscribe1 = jest.fn();
      const unsubscribe2 = jest.fn();
      mockOnConfigUpdated
        .mockReturnValueOnce(unsubscribe1)
        .mockReturnValueOnce(unsubscribe2);

      enableRealtime({}, jest.fn());
      disableRealtime();
      expect(unsubscribe1).toHaveBeenCalled();

      enableRealtime({}, jest.fn());
      disableRealtime();
      expect(unsubscribe2).toHaveBeenCalled();
    });
  });
});
