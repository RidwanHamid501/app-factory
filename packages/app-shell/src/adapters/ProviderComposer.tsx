import { ReactNode } from 'react';
import { Logger } from '../utils/logger';
import { useAdapterRegistry } from './AdapterRegistry';

export function ProviderComposer({ children }: { children: ReactNode }) {
  const providers = useAdapterRegistry((state) => state.getProviders()) ?? [];

  Logger.debug('[ProviderComposer] Composing providers:', providers.length);

  // Compose providers from innermost to outermost using reduce
  return providers.reduce<ReactNode>(
    (acc, providerDef) => {
      const Provider = providerDef.provider;
      Logger.debug('[ProviderComposer] Mounting provider:', providerDef.name);
      return <Provider>{acc}</Provider>;
    },
    children
  );
}
