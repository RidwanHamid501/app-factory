import { createContext, useContext, ReactNode } from 'react';
import { useAdapterRegistry } from './AdapterRegistry';
import type { AppAdapter } from './types';

interface AdapterContextValue {
  adapter: AppAdapter | null;
  isRegistered: boolean;
}

const AdapterContext = createContext<AdapterContextValue | null>(null);

export function AdapterProvider({ children }: { children: ReactNode }) {
  const adapter = useAdapterRegistry((state) => state.adapter);
  const isRegistered = useAdapterRegistry((state) => state.isRegistered);

  const value: AdapterContextValue = {
    adapter,
    isRegistered,
  };

  return (
    <AdapterContext.Provider value={value}>
      {children}
    </AdapterContext.Provider>
  );
}

export function useAdapterContext(): AdapterContextValue {
  const context = useContext(AdapterContext);
  if (!context) {
    throw new Error('useAdapterContext must be used within AdapterProvider');
  }
  return context;
}
