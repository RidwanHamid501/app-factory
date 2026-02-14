export type EventProperties = Record<string, unknown>;

export type UserProperties = Record<string, unknown>;

export interface ITelemetryManager {
  track(eventName: string, properties?: EventProperties): void;
  screen(screenName: string, properties?: EventProperties): void;
  identify(userId: string, properties?: UserProperties): void;
  reset(): void;
}
