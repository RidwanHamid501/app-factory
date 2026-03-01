import { useState } from 'react';
import { DeletionConfirmation, DeletionWarning, DEFAULT_DELETION_WARNING } from './types';

export interface UseConfirmationResult {
  isOpen: boolean;
  warning: DeletionWarning;
  acknowledged: boolean;
  showConfirmation: (customWarning?: Partial<DeletionWarning>) => void;
  hideConfirmation: () => void;
  setAcknowledged: (value: boolean) => void;
  confirmDeletion: () => DeletionConfirmation | null;
}

export function useConfirmation(): UseConfirmationResult {
  const [isOpen, setIsOpen] = useState(false);
  const [warning, setWarning] = useState<DeletionWarning>(DEFAULT_DELETION_WARNING);
  const [acknowledged, setAcknowledged] = useState(false);

  const showConfirmation = (customWarning?: Partial<DeletionWarning>) => {
    setWarning({ ...DEFAULT_DELETION_WARNING, ...customWarning });
    setAcknowledged(false);
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
    setAcknowledged(false);
  };

  const confirmDeletion = (): DeletionConfirmation | null => {
    if (!acknowledged) {
      return null;
    }

    return {
      acknowledged: true,
      timestamp: new Date(),
    };
  };

  return {
    isOpen,
    warning,
    acknowledged,
    showConfirmation,
    hideConfirmation,
    setAcknowledged,
    confirmDeletion,
  };
}
