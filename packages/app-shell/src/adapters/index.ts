// Extension Points for App-Specific Modules
export { useAdapterRegistry } from './AdapterRegistry';
export { validateAdapterPublic as validateAdapter } from './AdapterRegistry';
export { validateAdapterStrict } from './AdapterValidator';
export { AdapterProvider, useAdapterContext } from './AdapterContext';
export { ProviderComposer } from './ProviderComposer';
export * from './hooks';
export type {
  AppAdapter,
  ScreenDefinition,
  ProviderDefinition,
  MiddlewareDefinition,
  InitializationHooks,
  AdapterConfig,
  LifecycleContext,
  AdapterValidationResult,
  AdapterRegistryState,
} from './types';
