import { renderHook, act } from '@testing-library/react-native';
import { useRemoteConfig } from '../useRemoteConfig';
import { useRemoteConfigStore } from '../../remoteConfigStore';

describe('useRemoteConfig', () => {
  beforeEach(() => {
    useRemoteConfigStore.getState().reset();
  });

  it('✅ returns correct initialization state', () => {
    const { result } = renderHook(() => useRemoteConfig());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('✅ returns correct config snapshot', () => {
    const mockConfig = {
      values: { test_key: 'test_value' },
      source: 'remote' as const,
      lastFetchTime: 1234567890,
      lastFetchStatus: 'success' as const,
    };

    act(() => {
      useRemoteConfigStore.getState().setConfig(mockConfig);
    });

    const { result } = renderHook(() => useRemoteConfig());

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.source).toBe('remote');
    expect(result.current.lastFetchTime).toBe(1234567890);
    expect(result.current.lastFetchStatus).toBe('success');
  });

  it('✅ updates when config changes', () => {
    const { result } = renderHook(() => useRemoteConfig());

    expect(result.current.source).toBe('default');

    const newConfig = {
      values: { new_key: 'new_value' },
      source: 'remote' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    act(() => {
      useRemoteConfigStore.getState().setConfig(newConfig);
    });

    expect(result.current.source).toBe('remote');
    expect(result.current.config.values.new_key).toBe('new_value');
  });

  it('✅ semantic: tracks fetching state correctly', () => {
    const { result } = renderHook(() => useRemoteConfig());

    expect(result.current.isFetching).toBe(false);

    act(() => {
      useRemoteConfigStore.getState().setFetching(true);
    });

    expect(result.current.isFetching).toBe(true);

    act(() => {
      useRemoteConfigStore.getState().setFetching(false);
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('✅ semantic: exposes error state', () => {
    const { result } = renderHook(() => useRemoteConfig());

    expect(result.current.error).toBeNull();

    const error = new Error('Test error');
    act(() => {
      useRemoteConfigStore.getState().setError(error);
    });

    expect(result.current.error).toEqual(error);
  });
});
