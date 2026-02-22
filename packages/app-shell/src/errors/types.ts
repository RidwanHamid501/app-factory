import type { ErrorInfo as ReactErrorInfo } from 'react';

// Sentry configuration for error reporting - Official docs: https://docs.sentry.io/platforms/react-native/configuration/options
export interface SentryConfig {
  dsn: string;
  environment?: string;
  release?: string;
  dist?: string;
  debug?: boolean;
  sampleRate?: number;
  maxBreadcrumbs?: number;
  enabled?: boolean;
}

// Error boundary configuration - Official docs: https://github.com/bvaughn/react-error-boundary#api
export interface ErrorBoundaryConfig {
  fallback?: React.ComponentType<ErrorFallbackProps>;
  sentry?: SentryConfig;
  onError?: (error: Error, errorInfo: ReactErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  showDetailedError?: boolean;
}

// Props passed to fallback components - Official docs: https://github.com/bvaughn/react-error-boundary#fallbackcomponent-prop
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: (...args: any[]) => void;
  isDevelopment: boolean;
}
