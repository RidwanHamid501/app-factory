import { Logger } from '../utils/logger';
import type { AppAdapter, AdapterValidationResult } from './types';

export function validateAdapterStrict(adapter: AppAdapter): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const basicResult = validateBasic(adapter);
  errors.push(...basicResult.errors);
  warnings.push(...basicResult.warnings);

  if (adapter.screens) {
    const screenResult = validateScreens(adapter.screens);
    errors.push(...screenResult.errors);
    warnings.push(...screenResult.warnings);
  }

  if (adapter.providers) {
    const providerResult = validateProviders(adapter.providers);
    errors.push(...providerResult.errors);
    warnings.push(...providerResult.warnings);
  }

  if (adapter.middleware) {
    const middlewareResult = validateMiddleware(adapter.middleware);
    errors.push(...middlewareResult.errors);
    warnings.push(...middlewareResult.warnings);
  }

  if (adapter.initialization) {
    const initResult = validateInitialization(adapter.initialization);
    errors.push(...initResult.errors);
    warnings.push(...initResult.warnings);
  }

  if (adapter.config) {
    const configResult = validateConfig(adapter.config);
    errors.push(...configResult.errors);
    warnings.push(...configResult.warnings);
  }

  if (!adapter.screens && !adapter.providers && !adapter.middleware && !adapter.initialization) {
    warnings.push('Adapter has no screens, providers, middleware, or initialization hooks');
  }

  const isValid = errors.length === 0;
  
  if (!isValid) {
    Logger.error('[AdapterValidator] Validation failed:', { errors, warnings });
  }

  return { isValid, errors, warnings };
}

function validateBasic(adapter: AppAdapter): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!adapter.name) errors.push('name is required');
  if (!adapter.version) errors.push('version is required');
  
  if (adapter.version && !/^\d+\.\d+\.\d+/.test(adapter.version)) {
    warnings.push('version should follow semver format (e.g., 1.0.0)');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function validateScreens(screens: AppAdapter['screens']): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const screenNames = new Set<string>();

  screens?.forEach((screen, index) => {
    if (!screen.name) {
      errors.push(`screens[${index}].name is required`);
    }
    if (!screen.component) {
      errors.push(`screens[${index}].component is required`);
    }
    
    if (screen.name && screenNames.has(String(screen.name))) {
      errors.push(`Duplicate screen name: ${String(screen.name)}`);
    }
    screenNames.add(String(screen.name));

    if (screen.component && typeof screen.component !== 'function') {
      errors.push(`screens[${index}].component must be a React component`);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

function validateProviders(providers: AppAdapter['providers']): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const providerNames = new Set<string>();

  providers?.forEach((provider, index) => {
    if (!provider.name) {
      errors.push(`providers[${index}].name is required`);
    }
    if (!provider.provider) {
      errors.push(`providers[${index}].provider is required`);
    }

    if (provider.name && providerNames.has(provider.name)) {
      errors.push(`Duplicate provider name: ${provider.name}`);
    }
    providerNames.add(provider.name);

    if (provider.provider && typeof provider.provider !== 'function') {
      errors.push(`providers[${index}].provider must be a React component`);
    }

    if (provider.order !== undefined && (provider.order < 0 || provider.order > 1000)) {
      warnings.push(`providers[${index}].order should be between 0 and 1000`);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

function validateMiddleware(middleware: AppAdapter['middleware']): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hooks = [
    'onLifecycleEvent',
    'onNavigate',
    'onDeepLink',
    'onError',
    'onTelemetryEvent',
  ];

  hooks.forEach((hook) => {
    const fn = middleware?.[hook as keyof typeof middleware];
    if (fn !== undefined && typeof fn !== 'function') {
      errors.push(`middleware.${hook} must be a function`);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

function validateInitialization(init: AppAdapter['initialization']): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hooks = ['beforeMount', 'afterMount', 'onReady', 'onBackground', 'onForeground'];

  hooks.forEach((hook) => {
    const fn = init?.[hook as keyof typeof init];
    if (fn !== undefined && typeof fn !== 'function') {
      errors.push(`initialization.${hook} must be a function`);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
}

function validateConfig(config: AppAdapter['config']): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config) {
    return { isValid: true, errors, warnings };
  }

  if (config.theme) {
    if (config.theme.light && typeof config.theme.light !== 'object') {
      errors.push('config.theme.light must be an object');
    }
    if (config.theme.dark && typeof config.theme.dark !== 'object') {
      errors.push('config.theme.dark must be an object');
    }
  }

  if (config.settings && typeof config.settings !== 'object') {
    errors.push('config.settings must be an object');
  }

  if (config.strings && typeof config.strings !== 'object') {
    errors.push('config.strings must be an object');
  }

  if (config.featureFlags) {
    if (typeof config.featureFlags !== 'object') {
      errors.push('config.featureFlags must be an object');
    } else {
      Object.entries(config.featureFlags).forEach(([key, value]) => {
        const valueType = typeof value;
        if (!['boolean', 'string', 'number'].includes(valueType)) {
          errors.push(`config.featureFlags.${key} must be boolean, string, or number`);
        }
      });
    }
  }

  if (config.linkingPrefixes) {
    if (!Array.isArray(config.linkingPrefixes)) {
      errors.push('config.linkingPrefixes must be an array');
    } else {
      config.linkingPrefixes.forEach((prefix, index) => {
        if (typeof prefix !== 'string') {
          errors.push(`config.linkingPrefixes[${index}] must be a string`);
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}
