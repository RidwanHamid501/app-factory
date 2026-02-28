import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import { RemoteConfigProvider } from '../RemoteConfigProvider';
import * as RemoteConfigManager from '../RemoteConfigManager';
import { useRemoteConfigStore } from '../remoteConfigStore';

// Mock Logger
jest.mock('../../utils/logger', () => ({
  Logger: {
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock RemoteConfigManager
jest.mock('../RemoteConfigManager');

describe('RemoteConfigProvider', () => {
  const TestChild = () => <View testID="test-child" />;

  beforeEach(() => {
    jest.clearAllMocks();
    useRemoteConfigStore.getState().reset();
  });

  it('✅ initializes config on mount', async () => {
    const mockSnapshot = {
      values: { test: 'value' },
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(mockSnapshot);

    render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      expect(RemoteConfigManager.initialize).toHaveBeenCalled();
    });

    expect(RemoteConfigManager.fetchAndActivate).toHaveBeenCalled();
  });

  it('✅ sets initialized state correctly', async () => {
    const mockSnapshot = {
      values: {},
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(mockSnapshot);

    render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      const state = useRemoteConfigStore.getState();
      expect(state.isInitialized).toBe(true);
    });
  });

  it('✅ fetches config in background', async () => {
    const cachedSnapshot = {
      values: { cached: 'value' },
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    const remoteSnapshot = {
      values: { remote: 'value' },
      source: 'remote' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(cachedSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(remoteSnapshot);

    render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      const state = useRemoteConfigStore.getState();
      expect(state.config.source).toBe('remote');
    });

    expect(RemoteConfigManager.fetchAndActivate).toHaveBeenCalled();
  });

  it('✅ enables real-time when configured', async () => {
    const mockSnapshot = {
      values: {},
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.enableRealtime as jest.Mock).mockImplementation(() => {});

    const config = { enableRealtime: true };

    render(
      <RemoteConfigProvider config={config}>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      expect(RemoteConfigManager.enableRealtime).toHaveBeenCalled();
    });
  });

  it('✅ cleans up real-time on unmount', async () => {
    const mockSnapshot = {
      values: {},
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.enableRealtime as jest.Mock).mockImplementation(() => {});
    (RemoteConfigManager.disableRealtime as jest.Mock).mockImplementation(() => {});

    const config = { enableRealtime: true };

    const { unmount } = render(
      <RemoteConfigProvider config={config}>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      expect(RemoteConfigManager.enableRealtime).toHaveBeenCalled();
    });

    unmount();

    expect(RemoteConfigManager.disableRealtime).toHaveBeenCalled();
  });

  it('✅ updates store with fetched config', async () => {
    const cachedSnapshot = {
      values: { key1: 'value1' },
      source: 'cache' as const,
      lastFetchTime: Date.now() - 10000,
      lastFetchStatus: 'success' as const,
    };

    const remoteSnapshot = {
      values: { key1: 'value1', key2: 'value2' },
      source: 'remote' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(cachedSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(remoteSnapshot);

    render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    // Check cached config is set first
    await waitFor(() => {
      const state = useRemoteConfigStore.getState();
      expect(state.config.values.key1).toBe('value1');
    });

    // Wait for remote config
    await waitFor(() => {
      const state = useRemoteConfigStore.getState();
      expect(state.config.source).toBe('remote');
      expect(state.config.values.key2).toBe('value2');
    });
  });

  it('❌ handles initialization error gracefully', async () => {
    const error = new Error('Initialization failed');
    (RemoteConfigManager.initialize as jest.Mock).mockRejectedValue(error);

    render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      const state = useRemoteConfigStore.getState();
      expect(state.error).toEqual(error);
      expect(state.isInitialized).toBe(true); // Still marks as initialized
      expect(state.isFetching).toBe(false);
    });
  });

  it('✅ semantic: initialization happens only once', async () => {
    const mockSnapshot = {
      values: {},
      source: 'cache' as const,
      lastFetchTime: Date.now(),
      lastFetchStatus: 'success' as const,
    };

    (RemoteConfigManager.initialize as jest.Mock).mockResolvedValue(mockSnapshot);
    (RemoteConfigManager.fetchAndActivate as jest.Mock).mockResolvedValue(mockSnapshot);

    const { rerender } = render(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      expect(RemoteConfigManager.initialize).toHaveBeenCalledTimes(1);
    });

    // Force re-render
    rerender(
      <RemoteConfigProvider>
        <TestChild />
      </RemoteConfigProvider>
    );

    await waitFor(() => {
      // Should still be called only once
      expect(RemoteConfigManager.initialize).toHaveBeenCalledTimes(1);
    });
  });
});
