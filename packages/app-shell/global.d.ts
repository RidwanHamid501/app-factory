// Global type declarations for React Native
declare const __DEV__: boolean;

// Override setTimeout to match React Native's signature
declare function setTimeout<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  ms?: number,
  ...args: TArgs
): number;
