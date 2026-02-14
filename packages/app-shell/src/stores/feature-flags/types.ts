export type FeatureFlagValue = boolean | string | number;

export interface FeatureFlags {
  [key: string]: FeatureFlagValue;
}
