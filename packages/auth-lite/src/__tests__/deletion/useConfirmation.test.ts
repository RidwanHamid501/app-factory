import { useConfirmation } from '../../deletion/useConfirmation';
import { renderHook, act } from '@testing-library/react-native';

describe('Deletion Confirmation Hook', () => {
  describe('useConfirmation', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() => useConfirmation());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.acknowledged).toBe(false);
    });

    it('should open confirmation with default warning', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.warning.title).toBe('Delete Account');
    });

    it('should open confirmation with custom warning', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation({
          title: 'Custom Title',
          message: 'Custom message',
        });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.warning.title).toBe('Custom Title');
      expect(result.current.warning.message).toBe('Custom message');
    });

    it('should close confirmation and reset acknowledgment', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation();
        result.current.setAcknowledged(true);
      });

      expect(result.current.acknowledged).toBe(true);

      act(() => {
        result.current.hideConfirmation();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.acknowledged).toBe(false);
    });

    it('should toggle acknowledgment', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation();
      });

      expect(result.current.acknowledged).toBe(false);

      act(() => {
        result.current.setAcknowledged(true);
      });

      expect(result.current.acknowledged).toBe(true);

      act(() => {
        result.current.setAcknowledged(false);
      });

      expect(result.current.acknowledged).toBe(false);
    });

    it('should return null confirmation if not acknowledged', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation();
      });

      const confirmation = result.current.confirmDeletion();

      expect(confirmation).toBeNull();
    });

    it('should return confirmation object when acknowledged', () => {
      const { result } = renderHook(() => useConfirmation());

      act(() => {
        result.current.showConfirmation();
        result.current.setAcknowledged(true);
      });

      const confirmation = result.current.confirmDeletion();

      expect(confirmation).not.toBeNull();
      expect(confirmation?.acknowledged).toBe(true);
      expect(confirmation?.timestamp).toBeInstanceOf(Date);
    });
  });
});
