import type { RestoreError } from './types';

/**
 * Get user-friendly error message for restore failures
 */
export function getRestoreErrorMessage(error: RestoreError): string {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Network connection error. Please check your internet and try again.';
    
    case 'INVALID_CREDENTIALS':
      return 'Unable to verify your account. Please sign in and try again.';
    
    case 'STORE_PROBLEM':
      return 'There was a problem connecting to the App Store. Please try again later.';
    
    case 'UNKNOWN':
    default:
      return error.message || 'Failed to restore purchases. Please try again.';
  }
}

/**
 * Check if restore error is recoverable
 */
export function isRecoverableRestoreError(error: RestoreError): boolean {
  const recoverableCodes = [
    'NETWORK_ERROR',
    'UNKNOWN',
  ];

  return recoverableCodes.includes(error.code || '');
}
