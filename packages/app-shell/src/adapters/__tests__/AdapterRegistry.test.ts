import {
  useAdapterRegistry,
  validateAdapterPublic,
} from '../AdapterRegistry';
import type { AppAdapter } from '../types';

describe('AdapterRegistry', () => {
  beforeEach(() => {
    // Reset registry before each test
    useAdapterRegistry.getState().reset();
  });

  describe('register', () => {
    it('should register valid adapter successfully', () => {
      const validAdapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          {
            name: 'Home',
            component: () => null,
            options: { title: 'Home' },
          },
        ],
      };

      const result = useAdapterRegistry.getState().register(validAdapter);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(useAdapterRegistry.getState().isRegistered).toBe(true);
      expect(useAdapterRegistry.getState().adapter).toEqual(validAdapter);
    });

    it('should return validation errors for invalid adapter', () => {
      const invalidAdapter = {
        name: '',
        version: '',
      } as AppAdapter;

      const result = useAdapterRegistry.getState().register(invalidAdapter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Adapter name is required');
      expect(result.errors).toContain('Adapter version is required');
      expect(useAdapterRegistry.getState().isRegistered).toBe(false);
    });

    it('should return warnings for incomplete adapter', () => {
      const minimalAdapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
      };

      const result = useAdapterRegistry.getState().register(minimalAdapter);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('no screens, providers, middleware');
    });

    it('should prevent duplicate screen names', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home', component: () => null },
          { name: 'Home', component: () => null },
        ],
      };

      const result = validateAdapterPublic(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate screen name'))).toBe(true);
    });

    it('should prevent duplicate provider names', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'TestProvider', provider: ({ children }) => children },
          { name: 'TestProvider', provider: ({ children }) => children },
        ],
      };

      const result = validateAdapterPublic(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate provider name'))).toBe(true);
    });
  });

  describe('getScreens', () => {
    it('should return screens in original order', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home', component: () => null },
          { name: 'Profile', component: () => null },
        ],
      };

      useAdapterRegistry.getState().register(adapter);
      const screens = useAdapterRegistry.getState().getScreens();

      expect(screens).toHaveLength(2);
      expect(screens?.[0]?.name).toBe('Home');
      expect(screens?.[1]?.name).toBe('Profile');
    });

    it('should return empty array when no screens registered', () => {
      const screens = useAdapterRegistry.getState().getScreens();
      expect(screens).toEqual([]);
    });
  });

  describe('getProviders', () => {
    it('should sort providers by order correctly', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'Provider1', provider: ({ children }) => children, order: 20 },
          { name: 'Provider2', provider: ({ children }) => children, order: 5 },
          { name: 'Provider3', provider: ({ children }) => children, order: 10 },
        ],
      };

      useAdapterRegistry.getState().register(adapter);
      const providers = useAdapterRegistry.getState().getProviders();

      expect(providers).toHaveLength(3);
      expect(providers![0].name).toBe('Provider2'); // order: 5
      expect(providers![1].name).toBe('Provider3'); // order: 10
      expect(providers![2].name).toBe('Provider1'); // order: 20
    });

    it('should use default order of 100 for providers without order', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'Provider1', provider: ({ children }) => children, order: 200 },
          { name: 'Provider2', provider: ({ children }) => children }, // default: 100
          { name: 'Provider3', provider: ({ children }) => children, order: 50 },
        ],
      };

      useAdapterRegistry.getState().register(adapter);
      const providers = useAdapterRegistry.getState().getProviders();

      expect(providers?.[0]?.name).toBe('Provider3'); // order: 50
      expect(providers?.[1]?.name).toBe('Provider2'); // order: 100 (default)
      expect(providers?.[2]?.name).toBe('Provider1'); // order: 200
    });

    it('should return empty array when no providers registered', () => {
      const providers = useAdapterRegistry.getState().getProviders();
      expect(providers).toEqual([]);
    });
  });

  describe('getMiddleware', () => {
    it('should return middleware hooks', () => {
      const onNavigate = jest.fn(() => true);
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        middleware: {
          onNavigate,
        },
      };

      useAdapterRegistry.getState().register(adapter);
      const middleware = useAdapterRegistry.getState().getMiddleware();

      expect(middleware?.onNavigate).toBe(onNavigate);
    });

    it('should return empty object when no middleware registered', () => {
      const middleware = useAdapterRegistry.getState().getMiddleware();
      expect(middleware).toEqual({});
    });
  });

  describe('getConfig', () => {
    it('should return config object', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        config: {
          theme: { light: {} },
          settings: { appName: 'Test App' },
        },
      };

      useAdapterRegistry.getState().register(adapter);
      const config = useAdapterRegistry.getState().getConfig();

      expect(config?.theme).toBeDefined();
      expect(config?.settings?.appName).toBe('Test App');
    });

    it('should return empty object when no config registered', () => {
      const config = useAdapterRegistry.getState().getConfig();
      expect(config).toEqual({});
    });
  });

  describe('reset', () => {
    it('should reset registry to initial state', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
      };

      useAdapterRegistry.getState().register(adapter);
      expect(useAdapterRegistry.getState().isRegistered).toBe(true);

      useAdapterRegistry.getState().reset();

      expect(useAdapterRegistry.getState().isRegistered).toBe(false);
      expect(useAdapterRegistry.getState().adapter).toBeNull();
      expect(useAdapterRegistry.getState().validationResult).toBeNull();
    });
  });
});
