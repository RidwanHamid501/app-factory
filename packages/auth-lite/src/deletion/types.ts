export interface DeletionConfirmation {
  acknowledged: boolean;
  timestamp: Date;
}

export interface DeletionWarning {
  title: string;
  message: string;
  consequences: string[];
  isPermanent: boolean;
  requiresReauth: boolean;
}

export const DEFAULT_DELETION_WARNING: DeletionWarning = {
  title: 'Delete Account',
  message: 'This action cannot be undone. All your data will be permanently deleted.',
  consequences: [
    'Your account will be permanently deleted',
    'All personal data will be removed',
    'You will lose access to all content',
    'Active subscriptions will be cancelled',
    'This action cannot be reversed',
  ],
  isPermanent: true,
  requiresReauth: true,
};
