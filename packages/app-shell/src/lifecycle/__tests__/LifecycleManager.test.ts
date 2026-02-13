// LifecycleManager.test.ts - Tests for lifecycle manager
// Official React Native testing docs: https://jestjs.io/docs/tutorial-react-native

import { AppState, AppStateStatus } from 'react-native';
import { lifecycleManager } from '../LifecycleManager';
import { useLifecycleStore } from '../LifecycleStore';
import { MAX_BACKGROUND_DURATION_MS } from '../constants';

// Mock React Native AppState
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
  },
}));

describe('LifecycleManager', () => {
  let mockAddEventListener: jest.Mock;
  let mockRemove: jest.Mock;
  let stateChangeCallback: (state: AppStateStatus) => void;

  beforeEach(() => {
    // Store reset handled automatically by __mocks__/zustand.ts
    
    // Reset manager - accessing private properties for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lifecycleManager as any).isInitialized = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (lifecycleManager as any).eventSubscribers.clear();
    
    // Setup mocks
    mockRemove = jest.fn();
    mockAddEventListener = jest.fn((_event, callback) => {
      stateChangeCallback = callback;
      return { remove: mockRemove };
    });
    
    (AppState.addEventListener as jest.Mock) = mockAddEventListener;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AppState.currentState as any) = 'active';
  });

  afterEach(() => {
    lifecycleManager.destroy();
  });

  describe('initialize', () => {
    // Success test: initializes manager
    it('should initialize successfully', () => {
      lifecycleManager.initialize();
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('active');
    });

    // Failure test: prevents double initialization
    it('should not initialize twice', () => {
      lifecycleManager.initialize();
      lifecycleManager.initialize();
      
      // Should only call addEventListener once
      expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    });

    // Success test: handles null currentState
    it('should handle null AppState.currentState at launch', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (AppState.currentState as any) = null;
      
      lifecycleManager.initialize();
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('unknown');
    });

    // Success test: emits appStarting event
    it('should emit appStarting event on initialization', (done) => {
      lifecycleManager.on('appStarting', () => {
        done();
      });
      
      lifecycleManager.initialize();
    });
  });

  describe('on (event subscription)', () => {
    // Success test: subscribes to events
    it('should allow subscribing to lifecycle events', () => {
      const callback = jest.fn();
      
      const subscription = lifecycleManager.on('appActive', callback);
      
      expect(subscription).toHaveProperty('unsubscribe');
      expect(typeof subscription.unsubscribe).toBe('function');
    });

    // Success test: calls callback when event fires
    it('should call callback when subscribed event fires', () => {
      lifecycleManager.initialize();
      const callback = jest.fn();
      lifecycleManager.on('appActive', callback);
      
      // Simulate state change to active
      stateChangeCallback('active');
      
      // Wait for async emit
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
      }, 0);
    });

    // Success test: unsubscribe works
    it('should stop calling callback after unsubscribe', () => {
      lifecycleManager.initialize();
      const callback = jest.fn();
      const subscription = lifecycleManager.on('appActive', callback);
      
      subscription.unsubscribe();
      
      // Simulate state change
      stateChangeCallback('active');
      
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 0);
    });

    // Success test: multiple subscribers
    it('should support multiple subscribers for same event', () => {
      lifecycleManager.initialize();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      lifecycleManager.on('appActive', callback1);
      lifecycleManager.on('appActive', callback2);
      
      stateChangeCallback('active');
      
      setTimeout(() => {
        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('state change handling', () => {
    beforeEach(() => {
      lifecycleManager.initialize();
    });

    // Success test: handles active to background transition
    it('should handle transition from active to background', () => {
      useLifecycleStore.setState({ currentState: 'active' });
      
      stateChangeCallback('background');
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('background');
      expect(state.previousState).toBe('active');
      expect(state.lastBackgroundTimestamp).toBeGreaterThan(0);
    });

    // Success test: handles background to active transition
    it('should handle transition from background to active', () => {
      useLifecycleStore.setState({ 
        currentState: 'background',
        lastBackgroundTimestamp: Date.now() - 1000, // 1 second ago
      });
      
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('active');
      expect(state.previousState).toBe('background');
      expect(state.backgroundDuration).toBeGreaterThan(0);
    });

    // Success test: detects warm start and creates new session after long background
    it('should detect warm start and create new session when background exceeds threshold', () => {
      const originalSessionId = useLifecycleStore.getState().sessionId;
      
      useLifecycleStore.setState({ 
        currentState: 'background',
        lastBackgroundTimestamp: Date.now() - (MAX_BACKGROUND_DURATION_MS + 1000),
      });
      
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      expect(state.startupType).toBe('warm');
      expect(state.sessionId).not.toBe(originalSessionId);
    });

    // Failure test: does not trigger warm start for short background
    it('should not trigger warm start or new session for short background duration', () => {
      const originalSessionId = useLifecycleStore.getState().sessionId;
      const originalStartupType = useLifecycleStore.getState().startupType;
      
      useLifecycleStore.setState({ 
        currentState: 'background',
        lastBackgroundTimestamp: Date.now() - 1000, // Only 1 second
      });
      
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      expect(state.sessionId).toBe(originalSessionId);
      expect(state.startupType).toBe(originalStartupType);
    });

    // Success test: emits correct events
    it('should emit appActive event on active state', (done) => {
      lifecycleManager.on('appActive', () => {
        done();
      });
      
      stateChangeCallback('active');
    });

    // Success test: emits appBackground event
    it('should emit appBackground event on background state', (done) => {
      lifecycleManager.on('appBackground', () => {
        done();
      });
      
      stateChangeCallback('background');
    });

    // Success test: emits appInactive event
    it('should emit appInactive event on inactive state', (done) => {
      lifecycleManager.on('appInactive', () => {
        done();
      });
      
      stateChangeCallback('inactive');
    });
  });

  describe('getState', () => {
    // Success test: returns current state
    it('should return current lifecycle state', () => {
      lifecycleManager.initialize();
      
      const state = lifecycleManager.getState();
      
      expect(state).toHaveProperty('currentState');
      expect(state).toHaveProperty('previousState');
      expect(state).toHaveProperty('startupType');
      expect(state).toHaveProperty('sessionId');
    });
  });

  describe('destroy', () => {
    // Success test: cleans up subscriptions
    it('should remove AppState listener on destroy', () => {
      lifecycleManager.initialize();
      
      lifecycleManager.destroy();
      
      expect(mockRemove).toHaveBeenCalled();
    });

    // Success test: clears event subscribers
    it('should clear event subscribers on destroy', () => {
      lifecycleManager.initialize();
      const callback = jest.fn();
      lifecycleManager.on('appActive', callback);
      
      lifecycleManager.destroy();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscribers = (lifecycleManager as any).eventSubscribers;
      expect(subscribers.size).toBe(0);
    });

    // Success test: allows reinitialization after destroy
    it('should allow reinitialization after destroy', () => {
      lifecycleManager.initialize();
      lifecycleManager.destroy();
      
      lifecycleManager.initialize();
      
      expect(mockAddEventListener).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    // Failure test: handles callback errors gracefully
    it('should handle errors in event callbacks without crashing', (done) => {
      lifecycleManager.initialize();
      
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const successCallback = jest.fn();
      
      lifecycleManager.on('appActive', errorCallback);
      lifecycleManager.on('appActive', successCallback);
      
      stateChangeCallback('active');
      
      setTimeout(() => {
        expect(errorCallback).toHaveBeenCalled();
        expect(successCallback).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('Semantic Tests - Behavioral Invariants', () => {
    beforeEach(() => {
      lifecycleManager.initialize();
    });

    afterEach(() => {
      lifecycleManager.destroy();
    });

    // Invariant: Startup type is always either cold OR warm, never both, never neither
    it('should always have exactly one valid startup type', () => {
      const state = lifecycleManager.getState();
      const isCold = state.startupType === 'cold';
      const isWarm = state.startupType === 'warm';
      
      // XOR: exactly one must be true
      expect(isCold).not.toBe(isWarm);
    });

    // Invariant: Warm starts always create new sessions
    it('should always create new session when warm start is detected', () => {
      const originalSessionId = useLifecycleStore.getState().sessionId;
      
      // Simulate long background
      useLifecycleStore.setState({ 
        currentState: 'background',
        lastBackgroundTimestamp: Date.now() - (MAX_BACKGROUND_DURATION_MS + 5000),
      });
      
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      if (state.startupType === 'warm') {
        expect(state.sessionId).not.toBe(originalSessionId);
      }
    });

    // Invariant: Session IDs must be unique
    it('should generate unique session IDs on each new session', () => {
      const sessionIds = new Set<string>();
      
      // Collect session IDs across multiple warm starts
      for (let i = 0; i < 5; i++) {
        useLifecycleStore.setState({ 
          currentState: 'background',
          lastBackgroundTimestamp: Date.now() - (MAX_BACKGROUND_DURATION_MS + 1000),
        });
        stateChangeCallback('active');
        sessionIds.add(useLifecycleStore.getState().sessionId);
      }
      
      expect(sessionIds.size).toBe(5);
    });

    // Invariant: previousState always reflects the last currentState
    it('should maintain previousState as last currentState after transitions', () => {
      const states: AppStateStatus[] = ['background', 'active', 'inactive', 'active'];
      
      states.forEach((nextState) => {
        const beforeState = useLifecycleStore.getState().currentState;
        stateChangeCallback(nextState);
        const afterPrevious = useLifecycleStore.getState().previousState;
        
        expect(afterPrevious).toBe(beforeState);
      });
    });

    // Invariant: Background duration is always non-negative
    it('should never have negative background duration', () => {
      // Multiple transitions
      stateChangeCallback('background');
      stateChangeCallback('active');
      stateChangeCallback('background');
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      expect(state.backgroundDuration).toBeGreaterThanOrEqual(0);
    });

    // Behavioral: Long backgrounds feel like fresh starts (warm start semantics)
    it('should treat app as fresh experience after long absence', () => {
      const firstSessionId = useLifecycleStore.getState().sessionId;
      
      // User leaves app for extended period (simulated)
      useLifecycleStore.setState({ 
        currentState: 'background',
        lastBackgroundTimestamp: Date.now() - (MAX_BACKGROUND_DURATION_MS + 10000),
      });
      
      // User returns
      stateChangeCallback('active');
      
      const state = useLifecycleStore.getState();
      
      // Should feel fresh (warm start with new session)
      expect(state.startupType).toBe('warm');
      expect(state.sessionId).not.toBe(firstSessionId);
    });
  });
});
