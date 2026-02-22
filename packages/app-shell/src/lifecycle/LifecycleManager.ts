// LifecycleManager - Monitors app state using React Native AppState API
// Official docs: https://reactnative.dev/docs/appstate

import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { useLifecycleStore } from './LifecycleStore';
import { LifecycleCallback, LifecycleEvent } from './types';
import { MAX_BACKGROUND_DURATION_MS } from './constants';
import { Logger } from '../utils/logger';

interface InitConfig {
  coldStartThreshold?: number;
  sessionTimeout?: number;
}

class LifecycleManager {
  private appStateSubscription: NativeEventSubscription | null = null;
  private eventSubscribers: Map<LifecycleEvent, Set<LifecycleCallback>> = new Map();
  private isInitialized = false;
  private config: InitConfig = {};

  initialize(config: InitConfig = {}): void {
    if (this.isInitialized) {
      Logger.warn('LifecycleManager already initialized');
      return;
    }

    this.config = {
      coldStartThreshold: config.coldStartThreshold || MAX_BACKGROUND_DURATION_MS,
      sessionTimeout: config.sessionTimeout || 1800000,
    };

    Logger.info('Initializing LifecycleManager with config:', this.config);

    const initialState = AppState.currentState || 'unknown';
    useLifecycleStore.getState().setAppState(initialState);
    this.determineStartupType();

    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    this.isInitialized = true;
    this.emit('appStarting');
    Logger.info(`LifecycleManager initialized. Initial state: ${initialState}`);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    const store = useLifecycleStore.getState();
    const previousState = store.currentState;

    Logger.info(`App state changed: ${previousState} -> ${nextAppState}`);
    store.setAppState(nextAppState);

    if (previousState === 'active' && nextAppState.match(/inactive|background/)) {
      this.handleAppBackgrounding();
    } else if (previousState.match(/inactive|background/) && nextAppState === 'active') {
      this.handleAppForegrounding();
    }

    if (nextAppState === 'active') {
      this.emit('appActive');
    } else if (nextAppState === 'background') {
      this.emit('appBackground');
    } else if (nextAppState === 'inactive') {
      this.emit('appInactive');
    }
  };

  private handleAppBackgrounding(): void {
    Logger.info('App backgrounding');
    useLifecycleStore.getState().recordBackgroundTransition();
  }

  private handleAppForegrounding(): void {
    Logger.info('App foregrounding');

    const store = useLifecycleStore.getState();
    store.recordActiveTransition();

    const { backgroundDuration } = useLifecycleStore.getState();
    
    if (backgroundDuration > this.config.coldStartThreshold!) {
      Logger.info(`Long background duration (${backgroundDuration}ms). Warm start detected.`);
      store.setStartupType('warm');
      store.startNewSession();
    }
  }

  private determineStartupType(): void {
    useLifecycleStore.getState().setStartupType('cold');
    Logger.info('Startup type: cold');
  }

  on(event: LifecycleEvent, callback: LifecycleCallback): { unsubscribe: () => void } {
    if (!this.eventSubscribers.has(event)) {
      this.eventSubscribers.set(event, new Set());
    }

    this.eventSubscribers.get(event)!.add(callback);

    return {
      unsubscribe: () => {
        this.eventSubscribers.get(event)?.delete(callback);
      },
    };
  }

  private async emit(event: LifecycleEvent): Promise<void> {
    const subscribers = this.eventSubscribers.get(event);
    if (!subscribers || subscribers.size === 0) return;

    Logger.debug(`Emitting lifecycle event: ${event} (${subscribers.size} subscribers)`);

    const promises = Array.from(subscribers).map(async (callback) => {
      try {
        await callback();
      } catch (error) {
        Logger.error(`Error in lifecycle callback for ${event}:`, error);
      }
    });

    await Promise.all(promises);
  }

  destroy(): void {
    Logger.info('Destroying LifecycleManager');
    this.appStateSubscription?.remove();
    this.eventSubscribers.clear();
    this.isInitialized = false;
  }

  getState(): ReturnType<typeof useLifecycleStore.getState> {
    return useLifecycleStore.getState();
  }
}

export const lifecycleManager = new LifecycleManager();
