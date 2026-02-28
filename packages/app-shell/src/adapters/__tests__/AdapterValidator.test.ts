import { validateAdapterStrict } from '../AdapterValidator';
import type { AppAdapter, ProviderDefinition } from '../types';

describe('AdapterValidator', () => {
  describe('validateBasic', () => {
    it('should pass validation for minimal adapter', () => {
      const minimalAdapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
      };

      const result = validateAdapterStrict(minimalAdapter);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject adapter without name', () => {
      const adapter = {
        version: '1.0.0',
      } as AppAdapter;

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should reject adapter without version', () => {
      const adapter = {
        name: 'test-app',
      } as AppAdapter;

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('version is required');
    });

    it('should warn about non-semver version format', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: 'v1',
      };

      const result = validateAdapterStrict(adapter);

      expect(result.warnings.some(w => w.includes('semver format'))).toBe(true);
    });
  });

  describe('validateScreens', () => {
    it('should validate screen definitions', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home', component: () => null },
          { name: 'Profile', component: () => null },
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(true);
    });

    it('should detect missing screen name', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: '', component: () => null } as unknown,
        ] as AppAdapter['screens'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('name is required'))).toBe(true);
    });

    it('should detect missing screen component', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home' } as unknown,
        ] as AppAdapter['screens'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('component is required'))).toBe(true);
    });

    it('should detect duplicate screen names', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home', component: () => null },
          { name: 'Home', component: () => null },
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate screen name'))).toBe(true);
    });

    it('should detect invalid component type', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        screens: [
          { name: 'Home', component: 'not-a-component' as unknown },
        ] as AppAdapter['screens'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be a React component'))).toBe(true);
    });
  });

  describe('validateProviders', () => {
    it('should validate provider definitions', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'TestProvider', provider: ({ children }) => children },
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(true);
    });

    it('should detect missing provider name', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: '', component: (({ children }: { children: React.ReactNode }) => children) } as unknown as ProviderDefinition,
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('name is required'))).toBe(true);
    });

    it('should detect duplicate provider names', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'TestProvider', provider: ({ children }) => children },
          { name: 'TestProvider', provider: ({ children }) => children },
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate provider name'))).toBe(true);
    });

    it('should warn about order outside recommended range', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        providers: [
          { name: 'TestProvider', provider: ({ children }: { children: React.ReactNode }) => children, order: -1 },
        ],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.warnings.some(w => w.includes('should be between 0 and 1000'))).toBe(true);
    });
  });

  describe('validateMiddleware', () => {
    it('should validate middleware hooks', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        middleware: {
          onNavigate: () => true,
          onDeepLink: () => true,
        },
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(true);
    });

    it('should detect non-function middleware hooks', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        middleware: {
          onNavigate: 'not-a-function' as unknown,
        } as AppAdapter['middleware'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be a function'))).toBe(true);
    });
  });

  describe('validateInitialization', () => {
    it('should validate initialization hooks', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        initialization: {
          beforeMount: () => {},
          afterMount: () => {},
          onReady: () => {},
        },
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(true);
    });

    it('should detect non-function initialization hooks', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        initialization: {
          beforeMount: 'not-a-function' as unknown,
        } as AppAdapter['initialization'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be a function'))).toBe(true);
    });
  });

  describe('validateConfig', () => {
    it('should validate config structure', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        config: {
          theme: {},
          settings: { appName: 'Test' },
          strings: { welcome: 'Welcome' },
          featureFlags: { test: true },
          linkingPrefixes: ['myapp://'],
        },
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(true);
    });

    it('should detect invalid theme config', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        config: {
          theme: { light: 'not-an-object' } as unknown,
        } as AppAdapter['config'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be an object'))).toBe(true);
    });

    it('should detect invalid feature flag types', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        config: {
          featureFlags: { test: { invalid: true } } as unknown,
        } as AppAdapter['config'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be boolean, string, or number'))).toBe(true);
    });

    it('should detect non-array linking prefixes', () => {
      const adapter: AppAdapter = {
        name: 'test-app',
        version: '1.0.0',
        config: {
          linkingPrefixes: 'not-an-array' as unknown,
        } as AppAdapter['config'],
      };

      const result = validateAdapterStrict(adapter);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('must be an array'))).toBe(true);
    });
  });
});
