import { useState } from 'react';
import { useConfirmation } from './useConfirmation';
import type { DeletionWarning } from './types';

export interface UseDeletionResult {
  isDeleting: boolean;
  isConfirmationOpen: boolean;
  warning: DeletionWarning;
  acknowledged: boolean;
  error: string | null;
  initiateDeletion: (customWarning?: Partial<DeletionWarning>) => void;
  cancelDeletion: () => void;
  setAcknowledged: (value: boolean) => void;
}

export function useDeletion(): UseDeletionResult {
  const [isDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmation = useConfirmation();

  const initiateDeletion = (customWarning?: Partial<DeletionWarning>) => {
    setError(null);
    confirmation.showConfirmation(customWarning);
  };

  const cancelDeletion = () => {
    confirmation.hideConfirmation();
    setError(null);
  };

  return {
    isDeleting,
    isConfirmationOpen: confirmation.isOpen,
    warning: confirmation.warning,
    acknowledged: confirmation.acknowledged,
    error,
    initiateDeletion,
    cancelDeletion,
    setAcknowledged: confirmation.setAcknowledged,
  };
}
