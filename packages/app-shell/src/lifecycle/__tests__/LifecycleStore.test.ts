// LifecycleStore.test.ts - Tests for Zustand lifecycle store
// Official Zustand testing docs: https://zustand.docs.pmnd.rs/guides/testing

import { useLifecycleStore } from '../LifecycleStore';
import type { AppState } from '../types';

describe('LifecycleStore', () => {
  // Store reset handled automatically by __mocks__/zustand.ts

  describe('setAppState', () => {
    // Success test: updates app state
    it('should update current state and track previous state', () => {
      const { setAppState } = useLifecycleStore.getState();
      
      setAppState('active');
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('active');
      expect(state.previousState).toBe('unknown');
    });

    // Success test: tracks state transitions
    it('should correctly track multiple state transitions', () => {
      const { setAppState } = useLifecycleStore.getState();
      
      setAppState('active');
      setAppState('background');
      
      const state = useLifecycleStore.getState();
      expect(state.currentState).toBe('background');
      expect(state.previousState).toBe('active');
    });
  });

  describe('setStartupType', () => {
    // Success test: updates startup type
    it('should update startup type to cold', () => {
      const { setStartupType } = useLifecycleStore.getState();
      
      setStartupType('cold');
      
      const state = useLifecycleStore.getState();
      expect(state.startupType).toBe('cold');
    });

    // Success test: can change to warm
    it('should update startup type to warm', () => {
      const { setStartupType } = useLifecycleStore.getState();
      
      setStartupType('warm');
      
      const state = useLifecycleStore.getState();
      expect(state.startupType).toBe('warm');
    });
  });

  describe('startNewSession', () => {
    // Success test: generates new session
    it('should generate new session ID and timestamp', () => {
      const originalSessionId = useLifecycleStore.getState().sessionId;
      const { startNewSession } = useLifecycleStore.getState();
      
      startNewSession();
      
      const state = useLifecycleStore.getState();
      expect(state.sessionId).not.toBe(originalSessionId);
      expect(state.sessionStartTime).toBeGreaterThan(0);
    });

    // Success test: multiple calls create different sessions
    it('should create unique session IDs on multiple calls', () => {
      const { startNewSession } = useLifecycleStore.getState();
      
      startNewSession();
      const sessionId1 = useLifecycleStore.getState().sessionId;
      
      startNewSession();
      const sessionId2 = useLifecycleStore.getState().sessionId;
      
      expect(sessionId1).not.toBe(sessionId2);
    });
  });

  describe('recordBackgroundTransition', () => {
    // Success test: records background timestamp
    it('should record timestamp when app goes to background', () => {
      const { recordBackgroundTransition } = useLifecycleStore.getState();
      const beforeTime = Date.now();
      
      recordBackgroundTransition();
      
      const state = useLifecycleStore.getState();
      expect(state.lastBackgroundTimestamp).toBeGreaterThanOrEqual(beforeTime);
    });

    // Success test: updates on subsequent calls
    it('should update timestamp on multiple background transitions', async () => {
      const { recordBackgroundTransition } = useLifecycleStore.getState();
      
      recordBackgroundTransition();
      const firstTimestamp = useLifecycleStore.getState().lastBackgroundTimestamp;
      
      // Wait a bit for timestamp to advance
      await new Promise(resolve => setTimeout(resolve, 10));
      
      recordBackgroundTransition();
      const secondTimestamp = useLifecycleStore.getState().lastBackgroundTimestamp;
      
      expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });
  });

  describe('recordActiveTransition', () => {
    // Success test: records active timestamp and calculates duration
    it('should record active timestamp and calculate background duration', async () => {
      const { recordBackgroundTransition, recordActiveTransition } = useLifecycleStore.getState();
      
      recordBackgroundTransition();
      const backgroundTime = useLifecycleStore.getState().lastBackgroundTimestamp;
      
      // Simulate some time passing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      recordActiveTransition();
      
      const state = useLifecycleStore.getState();
      expect(state.lastActiveTimestamp).toBeGreaterThan(backgroundTime);
      expect(state.backgroundDuration).toBeGreaterThan(0);
    });

    // Failure/Edge case test: handles zero duration when no background recorded
    it('should handle zero duration when no background transition occurred', () => {
      const { recordActiveTransition } = useLifecycleStore.getState();
      
      recordActiveTransition();
      
      const state = useLifecycleStore.getState();
      expect(state.backgroundDuration).toBe(0);
    });

    // Success test: calculates duration correctly
    it('should calculate duration based on background timestamp', () => {
      const store = useLifecycleStore.getState();
      
      // Manually set background timestamp for predictable test
      useLifecycleStore.setState({
        lastBackgroundTimestamp: Date.now() - 10000, // 10 seconds ago
      });
      
      store.recordActiveTransition();
      
      const state = useLifecycleStore.getState();
      expect(state.backgroundDuration).toBeGreaterThanOrEqual(9000); // At least 9 seconds
      expect(state.backgroundDuration).toBeLessThan(11000); // Less than 11 seconds
    });
  });

  describe('initial state', () => {
    // Success test: has correct initial values
    it('should initialize with correct default values', () => {
      // Create fresh store instance by getting initial state
      const state = useLifecycleStore.getState();
      
      expect(state.currentState).toBe('unknown');
      expect(state.previousState).toBeNull();
      expect(state.startupType).toBe('cold');
      expect(state.sessionId).toMatch(/^session_/);
      expect(state.lastBackgroundTimestamp).toBe(0);
      expect(state.backgroundDuration).toBe(0);
    });
  });

  describe('Semantic Tests - State Invariants', () => {
    // Invariant: previousState tracks history correctly
    it('should always update previousState to reflect last currentState', () => {
      const { setAppState } = useLifecycleStore.getState();
      const transitions: AppState[] = ['active', 'background', 'inactive', 'active'];
      
      transitions.forEach((nextState, index) => {
        if (index > 0) {
          const beforeTransition = useLifecycleStore.getState().currentState;
          setAppState(nextState);
          expect(useLifecycleStore.getState().previousState).toBe(beforeTransition);
        } else {
          setAppState(nextState);
        }
      });
    });

    // Invariant: Background duration must be non-negative
    it('should never produce negative background duration', () => {
      const { recordBackgroundTransition, recordActiveTransition } = useLifecycleStore.getState();
      
      recordBackgroundTransition();
      recordActiveTransition();
      expect(useLifecycleStore.getState().backgroundDuration).toBeGreaterThanOrEqual(0);
      
      recordBackgroundTransition();
      recordActiveTransition();
      expect(useLifecycleStore.getState().backgroundDuration).toBeGreaterThanOrEqual(0);
    });

    // Invariant: Timestamps always move forward
    it('should have timestamps that advance over time', async () => {
      const { recordBackgroundTransition } = useLifecycleStore.getState();
      
      recordBackgroundTransition();
      const firstTimestamp = useLifecycleStore.getState().lastBackgroundTimestamp;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      recordBackgroundTransition();
      const secondTimestamp = useLifecycleStore.getState().lastBackgroundTimestamp;
      
      expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
    });

    // Behavioral: Session IDs must be unique across sessions
    it('should generate unique session ID on each new session', () => {
      const { startNewSession } = useLifecycleStore.getState();
      const sessionIds = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        startNewSession();
        sessionIds.add(useLifecycleStore.getState().sessionId);
      }
      
      expect(sessionIds.size).toBe(10);
    });

    // Behavioral: Startup type semantics
    it('should default to cold startup type for fresh app launch', () => {
      const state = useLifecycleStore.getState();
      expect(state.startupType).toBe('cold');
    });

    // Invariant: State transitions maintain consistency
    it('should maintain valid state after any sequence of transitions', () => {
      const { setAppState } = useLifecycleStore.getState();
      const validStates: AppState[] = ['active', 'background', 'inactive', 'unknown'];
      
      validStates.forEach((state) => {
        setAppState(state);
        const current = useLifecycleStore.getState();
        
        expect(validStates).toContain(current.currentState);
        if (current.previousState !== null) {
          expect(validStates).toContain(current.previousState);
        }
      });
    });
  });
});
