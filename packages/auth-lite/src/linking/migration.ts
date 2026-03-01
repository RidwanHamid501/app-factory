import { loadAnonymousId, clearAnonymousIdWithCache } from '../anonymous';
import { getCredentials } from '../credentials/retrieval';
import { Logger } from '../utils/logger';

export type MigrationCallback = (anonymousId: string, userId: string) => Promise<void>;

let migrationCallback: MigrationCallback | null = null;
let migrationAttempted = false;

export function setMigrationCallback(callback: MigrationCallback): void {
  Logger.info('[Migration] Migration callback registered');
  migrationCallback = callback;
}

export async function checkAndMigrate(): Promise<boolean> {
  if (migrationAttempted) {
    Logger.debug('[Migration] Migration already attempted, skipping');
    return false;
  }

  try {
    Logger.info('[Migration] Checking if migration needed');
    
    const anonymousId = await loadAnonymousId();
    if (!anonymousId) {
      Logger.debug('[Migration] No anonymous ID found, migration not needed');
      return false;
    }

    const credentials = await getCredentials();
    const userId = credentials.idToken;
    
    if (!userId) {
      Logger.debug('[Migration] No authenticated user, migration not needed');
      return false;
    }

    Logger.info('[Migration] Migration needed', { 
      anonymousId: anonymousId.substring(0, 8), 
      userId: userId.substring(0, 8) 
    });
    
    migrationAttempted = true;
    
    if (migrationCallback) {
      Logger.info('[Migration] Invoking migration callback');
      try {
        await migrationCallback(anonymousId, userId);
        await clearAnonymousIdWithCache();
        Logger.info('[Migration] Migration completed successfully');
      } catch (error) {
        Logger.error('[Migration] Migration callback failed:', error);
        throw error;
      }
    } else {
      Logger.warn('[Migration] No migration callback registered');
    }
    
    return true;
  } catch (error) {
    Logger.error('[Migration] Failed to check/migrate:', error);
    return false;
  }
}

export function resetMigrationFlag(): void {
  migrationAttempted = false;
  Logger.debug('[Migration] Migration flag reset');
}
