import { Logger } from '../utils/logger';
import type { Credentials } from '../auth/signin';

export type DeletionCallback = (
  userId: string,
  credentials: Credentials
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let deletionCallback: DeletionCallback | null = null;

export function setDeletionCallback(callback: DeletionCallback): void {
  Logger.info('[Deletion] Deletion callback registered');
  deletionCallback = callback;
}
