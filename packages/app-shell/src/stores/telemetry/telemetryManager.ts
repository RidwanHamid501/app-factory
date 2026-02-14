import { ITelemetryManager, EventProperties, UserProperties } from './types';
import { Logger } from '../../utils/logger';

class TelemetryManager implements ITelemetryManager {
  private enabled: boolean = true;
  
  track(eventName: string, properties?: EventProperties): void {
    if (!this.enabled) return;
    Logger.info(`[Analytics] Track: ${eventName}`, properties);
  }
  
  screen(screenName: string, properties?: EventProperties): void {
    if (!this.enabled) return;
    Logger.info(`[Analytics] Screen: ${screenName}`, properties);
  }
  
  identify(userId: string, properties?: UserProperties): void {
    if (!this.enabled) return;
    Logger.info(`[Analytics] Identify: ${userId}`, properties);
  }
  
  reset(): void {
    if (!this.enabled) return;
    Logger.info('[Analytics] Reset user');
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    Logger.info(`[Analytics] Telemetry ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const telemetryManager = new TelemetryManager();
