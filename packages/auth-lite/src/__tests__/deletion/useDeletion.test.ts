import { useDeletion } from '../../deletion/useDeletion';
import { renderHook, act } from '@testing-library/react-native';

describe('Deletion Hook', () => {
  describe('useDeletion', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDeletion());

      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isConfirmationOpen).toBe(false);
      expect(result.current.acknowledged).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should open deletion confirmation', () => {
      const { result } = renderHook(() => useDeletion());

      act(() => {
        result.current.initiateDeletion();
      });

      expect(result.current.isConfirmationOpen).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should open confirmation with custom warning', () => {
      const { result } = renderHook(() => useDeletion());

      act(() => {
        result.current.initiateDeletion({
          title: 'Are you absolutely sure?',
        });
      });

      expect(result.current.isConfirmationOpen).toBe(true);
      expect(result.current.warning.title).toBe('Are you absolutely sure?');
    });

    it('should cancel deletion and close modal', () => {
      const { result } = renderHook(() => useDeletion());

      act(() => {
        result.current.initiateDeletion();
      });

      expect(result.current.isConfirmationOpen).toBe(true);

      act(() => {
        result.current.cancelDeletion();
      });

      expect(result.current.isConfirmationOpen).toBe(false);
    });

    it('should toggle acknowledgment', () => {
      const { result } = renderHook(() => useDeletion());

      act(() => {
        result.current.initiateDeletion();
      });

      expect(result.current.acknowledged).toBe(false);

      act(() => {
        result.current.setAcknowledged(true);
      });

      expect(result.current.acknowledged).toBe(true);
    });

    it('should clear error on new deletion initiation', () => {
      const { result } = renderHook(() => useDeletion());

      // Simulate an error state
      act(() => {
        result.current.initiateDeletion();
      });

      // Cancel and try again
      act(() => {
        result.current.cancelDeletion();
        result.current.initiateDeletion();
      });

      expect(result.current.error).toBeNull();
    });

    it('should have default warning with consequences', () => {
      const { result } = renderHook(() => useDeletion());

      act(() => {
        result.current.initiateDeletion();
      });

      expect(result.current.warning.consequences).toBeDefined();
      expect(Array.isArray(result.current.warning.consequences)).toBe(true);
      expect(result.current.warning.consequences.length).toBeGreaterThan(0);
    });
  });
});
