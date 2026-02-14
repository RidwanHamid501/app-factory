import React, { useEffect } from 'react';
import { useInitializeTheme } from './theme/hooks';
import { Logger } from '../utils/logger';

interface StoreInitializerProps {
  children: React.ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  useInitializeTheme();
  
  useEffect(() => {
    Logger.info('All stores initialized');
  }, []);
  
  return <>{children}</>;
}
