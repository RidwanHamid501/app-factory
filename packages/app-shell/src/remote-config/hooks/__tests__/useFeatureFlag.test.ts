import { renderHook, act } from '@testing-library/react-native';
import { useRemoteFeatureFlag } from '../useFeatureFlag';
import { useRemoteConfigStore } from '../../remoteConfigStore';

describe('useRemoteFeatureFlag', () => {
  beforeEach(() => {
    useRemoteConfigStore.getState().reset();
  });

  it('✅ returns enabled status correctly', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: { feature_dark_mode: 'true' },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result } = renderHook(() => useRemoteFeatureFlag('feature_dark_mode'));

    expect(result.current.enabled).toBe(true);
    expect(result.current.variant).toBeUndefined();
    expect(result.current.metadata).toBeUndefined();
  });

  it('✅ returns variant when available', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: {
          feature_new_ui: 'true',
          feature_new_ui_variant: 'v2',
        },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result } = renderHook(() => useRemoteFeatureFlag('feature_new_ui'));

    expect(result.current.enabled).toBe(true);
    expect(result.current.variant).toBe('v2');
  });

  it('✅ returns metadata when available', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: {
          feature_paywall: 'true',
          feature_paywall_metadata_price: '9.99',
          feature_paywall_metadata_trial_days: '7',
        },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result } = renderHook(() => useRemoteFeatureFlag('feature_paywall'));

    expect(result.current.enabled).toBe(true);
    expect(result.current.metadata).toEqual({
      price: '9.99',
      trial_days: '7',
    });
  });

  it('✅ defaults to false when flag not found', () => {
    const { result } = renderHook(() => useRemoteFeatureFlag('non_existent_flag'));

    expect(result.current.enabled).toBe(false);
    expect(result.current.variant).toBeUndefined();
    expect(result.current.metadata).toBeUndefined();
  });

  it('✅ semantic: handles complex feature flag structure', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: {
          feature_experiment: 'true',
          feature_experiment_variant: 'control',
          feature_experiment_metadata_group: 'A',
          feature_experiment_metadata_weight: '50',
        },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result } = renderHook(() => useRemoteFeatureFlag('feature_experiment'));

    expect(result.current).toEqual({
      enabled: true,
      variant: 'control',
      metadata: {
        group: 'A',
        weight: '50',
      },
    });
  });

  it('✅ semantic: updates when config changes', () => {
    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: { feature_test: 'false' },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    const { result } = renderHook(() => useRemoteFeatureFlag('feature_test'));

    expect(result.current.enabled).toBe(false);

    act(() => {
      useRemoteConfigStore.getState().setConfig({
        values: { feature_test: 'true' },
        source: 'remote',
        lastFetchTime: Date.now(),
        lastFetchStatus: 'success',
      });
    });

    expect(result.current.enabled).toBe(true);
  });
});
