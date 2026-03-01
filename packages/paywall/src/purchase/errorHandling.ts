import type { PurchaseError } from './types';

export function getUserFriendlyErrorMessage(error: PurchaseError): string {
  if (error.userCancelled) {
    return 'Purchase cancelled';
  }

  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Network connection error. Please check your internet and try again.';
    case 'PURCHASE_NOT_ALLOWED':
      return 'Purchases are not allowed on this device.';
    case 'PURCHASE_INVALID':
      return 'This purchase is not available. Please try another option.';
    case 'PRODUCT_NOT_AVAILABLE':
      return 'This product is currently unavailable. Please try again later.';
    case 'PAYMENT_PENDING':
      return 'Your payment is pending approval. Please check back later.';
    case 'UNKNOWN':
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

export function isRecoverableError(error: PurchaseError): boolean {
  if (error.userCancelled) {
    return true;
  }

  const recoverableCodes = ['NETWORK_ERROR', 'UNKNOWN'];
  return recoverableCodes.includes(error.code || '');
}

export function requiresUserAction(error: PurchaseError): boolean {
  const actionRequiredCodes = ['PURCHASE_NOT_ALLOWED', 'PAYMENT_PENDING'];
  return actionRequiredCodes.includes(error.code || '');
}
