import { create } from 'zustand';
import { Logger } from '../utils/logger';
import type { AppAdapter, AdapterRegistryState, AdapterValidationResult } from './types';

interface AdapterRegistryStore extends AdapterRegistryState {
  register: (adapter: AppAdapter) => AdapterValidationResult;
  getAdapter: () => AppAdapter | null;
  getScreens: () => AppAdapter['screens'];
  getProviders: () => AppAdapter['providers'];
  getMiddleware: () => AppAdapter['middleware'];
  getInitHooks: () => AppAdapter['initialization'];
  getConfig: () => AppAdapter['config'];
  reset: () => void;
}

const initialState: AdapterRegistryState = {
  adapter: null,
  isRegistered: false,
  validationResult: null,
};

export const useAdapterRegistry = create<AdapterRegistryStore>()((set, get) => ({
  ...initialState,

  register: (adapter: AppAdapter): AdapterValidationResult => {
    Logger.info('[AdapterRegistry] Registering adapter:', adapter.name);
    const validationResult = validateAdapter(adapter);
    
    if (!validationResult.isValid) {
      Logger.error('[AdapterValidator] Validation failed for adapter:', adapter.name, validationResult.errors);
      set({ validationResult, isRegistered: false });
      return validationResult;
    }

    if (validationResult.warnings.length > 0) {
      Logger.warn('[AdapterValidator] Warnings for adapter:', adapter.name, validationResult.warnings);
    } else {
      Logger.info('[AdapterValidator] Validation passed for adapter:', adapter.name);
    }

    set({ adapter, isRegistered: true, validationResult });
    Logger.info('[AdapterRegistry] Adapter registered successfully');
    return validationResult;
  },

  getAdapter: () => get().adapter,
  getScreens: () => get().adapter?.screens ?? [],
  getProviders: () => {
    const providers = get().adapter?.providers ?? [];
    return [...providers].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  },
  getMiddleware: () => get().adapter?.middleware ?? {},
  getInitHooks: () => get().adapter?.initialization ?? {},
  getConfig: () => get().adapter?.config ?? {},
  reset: () => {
    Logger.debug('[AdapterRegistry] Resetting registry');
    set(initialState);
  },
}));

function validateAdapter(adapter: AppAdapter): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!adapter.name || adapter.name.trim() === '') {
    errors.push('Adapter name is required');
  }

  if (!adapter.version || adapter.version.trim() === '') {
    errors.push('Adapter version is required');
  }

  if (adapter.screens) {
    const screenNames = new Set<string>();
    adapter.screens.forEach((screen, index) => {
      if (!screen.name) {
        errors.push(`Screen at index ${index} missing name`);
      } else {
        const screenName = String(screen.name);
        if (screenNames.has(screenName)) {
          errors.push(`Duplicate screen name: ${screenName}`);
        }
        screenNames.add(screenName);
      }
      if (!screen.component) {
        errors.push(`Screen "${String(screen.name)}" missing component`);
      }
    });
  }

  if (adapter.providers) {
    const providerNames = new Set<string>();
    adapter.providers.forEach((provider, index) => {
      if (!provider.name) {
        errors.push(`Provider at index ${index} missing name`);
      }
      if (!provider.provider) {
        errors.push(`Provider "${provider.name}" missing provider component`);
      }
      if (providerNames.has(provider.name)) {
        errors.push(`Duplicate provider name: ${provider.name}`);
      }
      providerNames.add(provider.name);
    });
  }

  if (!adapter.screens && !adapter.providers && !adapter.middleware && !adapter.initialization) {
    warnings.push('Adapter has no screens, providers, middleware, or initialization hooks');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateAdapterPublic(adapter: AppAdapter): AdapterValidationResult {
  return validateAdapter(adapter);
}
