import { create } from 'zustand';
import { telemetryManager } from './telemetryManager';
import { Logger } from '../../utils/logger';

interface TelemetryStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useTelemetryStore = create<TelemetryStore>()((set) => ({
  enabled: true,
  
  setEnabled: (enabled: boolean) => {
    Logger.info(`Setting telemetry: ${enabled}`);
    telemetryManager.setEnabled(enabled);
    set({ enabled });
  },
}));
