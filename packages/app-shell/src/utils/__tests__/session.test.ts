// session.test.ts - Tests for session ID generation
// Official testing docs: https://jestjs.io/docs/tutorial-react-native

import { generateSessionId } from '../session';

describe('generateSessionId', () => {
  // Success test: generates unique IDs
  it('should generate a unique session ID', () => {
    const id = generateSessionId();
    
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^session_[a-z0-9]+_[a-z0-9]+$/);
  });

  // Success test: generates different IDs on subsequent calls
  it('should generate different IDs on multiple calls', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    
    expect(id1).not.toBe(id2);
  });

  // Success test: ID format consistency
  it('should always include "session_" prefix', () => {
    const id = generateSessionId();
    
    expect(id).toMatch(/^session_/);
  });

  // Edge case test: generates valid base-36 characters only
  it('should only contain valid base-36 characters (0-9, a-z)', () => {
    const id = generateSessionId();
    const parts = id.split('_');
    
    // Should have 3 parts: 'session', timestamp, random
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('session');
    
    // Timestamp and random should only contain base-36 chars
    expect(parts[1]).toMatch(/^[a-z0-9]+$/);
    expect(parts[2]).toMatch(/^[a-z0-9]+$/);
  });

  describe('Semantic Tests - Session ID Invariants', () => {
    // Invariant: Session IDs are globally unique
    it('should generate unique IDs across large sample size', () => {
      const sessionIds = new Set<string>();
      const sampleSize = 1000;
      
      for (let i = 0; i < sampleSize; i++) {
        sessionIds.add(generateSessionId());
      }
      
      // All IDs should be unique
      expect(sessionIds.size).toBe(sampleSize);
    });

    // Behavioral: Session IDs are sortable by time
    it('should generate IDs with chronological ordering capability', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      const id3 = generateSessionId();
      
      // Extract timestamp portion (after 'session_')
      const getTimestamp = (id: string) => id.split('_')[1];
      
      const ts1 = getTimestamp(id1);
      const ts2 = getTimestamp(id2);
      const ts3 = getTimestamp(id3);
      
      // Timestamps should be in order or equal (if generated in same millisecond)
      expect(ts1 <= ts2).toBe(true);
      expect(ts2 <= ts3).toBe(true);
    });

    // Invariant: Format consistency
    it('should always follow consistent format pattern', () => {
      const sessionIds = Array.from({ length: 100 }, () => generateSessionId());
      
      sessionIds.forEach((id) => {
        // Must match: session_[timestamp]_[random]
        expect(id).toMatch(/^session_[a-z0-9]+_[a-z0-9]+$/);
        
        // Must have exactly 3 parts
        expect(id.split('_').length).toBe(3);
      });
    });

    // Failure case: Never generates duplicates even under stress
    it('should not generate duplicates in rapid succession', () => {
      const rapidIds = Array.from({ length: 100 }, () => generateSessionId());
      const uniqueIds = new Set(rapidIds);
      
      expect(uniqueIds.size).toBe(rapidIds.length);
    });
  });
});
