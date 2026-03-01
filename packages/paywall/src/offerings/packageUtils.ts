import type { PurchasesPackage, PurchasesOffering } from './types';

// Get specific package type from offering
export function getMonthlyPackage(offering: PurchasesOffering): PurchasesPackage | null {
  return offering.monthly || null;
}

export function getAnnualPackage(offering: PurchasesOffering): PurchasesPackage | null {
  return offering.annual || null;
}

export function getLifetimePackage(offering: PurchasesOffering): PurchasesPackage | null {
  return offering.lifetime || null;
}

// Get all packages from offering
export function getSortedPackages(offering: PurchasesOffering): PurchasesPackage[] {
  return offering.availablePackages;
}

// Format package price (already localized by store)
export function formatPackagePrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

export function getPackageTitle(pkg: PurchasesPackage): string {
  return pkg.product.title;
}

export function getPackageDescription(pkg: PurchasesPackage): string {
  return pkg.product.description;
}

export function hasFreeTrial(pkg: PurchasesPackage): boolean {
  return pkg.product.introPrice !== null;
}

export function getFreeTrialText(pkg: PurchasesPackage): string | null {
  const introPrice = pkg.product.introPrice;
  if (!introPrice) return null;

  return introPrice.priceString;
}
