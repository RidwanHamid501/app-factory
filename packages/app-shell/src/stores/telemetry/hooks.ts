import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTelemetryStore } from './telemetryStore';
import { telemetryManager } from './telemetryManager';
import { EventProperties, UserProperties } from './types';

export function useTrackEvent() {
  return useCallback((eventName: string, properties?: EventProperties) => {
    if (telemetryManager.isEnabled()) {
      telemetryManager.track(eventName, properties);
    }
  }, []);
}

export function useTrackScreen() {
  return useCallback((screenName: string, properties?: EventProperties) => {
    if (telemetryManager.isEnabled()) {
      telemetryManager.screen(screenName, properties);
    }
  }, []);
}

export function useIdentifyUser() {
  return useCallback((userId: string, properties?: UserProperties) => {
    if (telemetryManager.isEnabled()) {
      telemetryManager.identify(userId, properties);
    }
  }, []);
}

export function useResetUser() {
  return useCallback(() => {
    if (telemetryManager.isEnabled()) {
      telemetryManager.reset();
    }
  }, []);
}

export function useTelemetry() {
  return useTelemetryStore(
    useShallow((state) => ({
      enabled: state.enabled,
      setEnabled: state.setEnabled,
    }))
  );
}

export function useTelemetryEnabled() {
  return useTelemetryStore((state) => state.enabled);
}
