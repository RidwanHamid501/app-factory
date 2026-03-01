import type { CustomerInfo, PurchasesEntitlementInfo } from './types';

export function isSubscribed(customerInfo: CustomerInfo): boolean {
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export function getActiveEntitlements(customerInfo: CustomerInfo): string[] {
  return Object.keys(customerInfo.entitlements.active);
}

export function willRenew(entitlement: PurchasesEntitlementInfo): boolean {
  return entitlement.willRenew;
}

export function getExpirationDate(entitlement: PurchasesEntitlementInfo): Date | null {
  return entitlement.expirationDate ? new Date(entitlement.expirationDate) : null;
}

export function isInTrialPeriod(entitlement: PurchasesEntitlementInfo): boolean {
  return entitlement.periodType === 'TRIAL';
}

export function isInGracePeriod(entitlement: PurchasesEntitlementInfo): boolean {
  return entitlement.periodType === 'INTRO';
}

export function hasBillingIssue(entitlement: PurchasesEntitlementInfo): boolean {
  return entitlement.billingIssueDetectedAt !== null;
}

export function getProductIdentifier(entitlement: PurchasesEntitlementInfo): string {
  return entitlement.productIdentifier;
}
