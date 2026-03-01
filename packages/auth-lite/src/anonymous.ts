import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useSyncExternalStore } from 'react';
import { Logger } from './utils/logger';

export const ANONYMOUS_ID_KEY = '@factory/auth-lite:anonymous-id';
export type AnonymousId = string;

export function generateAnonymousId(): AnonymousId {
  const id = Crypto.randomUUID();
  Logger.debug('[Anonymous] Generated ID:', id);
  return id;
}

export async function saveAnonymousId(id: AnonymousId): Promise<void> {
  try {
    await AsyncStorage.setItem(ANONYMOUS_ID_KEY, id);
    Logger.debug('[Anonymous] ID saved');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Native module is null')) {
      Logger.warn('[Anonymous] AsyncStorage not available yet, using in-memory ID');
      return;
    }
    Logger.error('[Anonymous] Failed to save ID:', error);
    throw new Error('Failed to save anonymous ID');
  }
}

export async function loadAnonymousId(): Promise<AnonymousId | null> {
  try {
    const id = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
    Logger.debug('[Anonymous] ID loaded:', id ?? 'none');
    return id;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Native module is null')) {
      Logger.warn('[Anonymous] AsyncStorage not available yet');
      return null;
    }
    Logger.error('[Anonymous] Failed to load ID:', error);
    return null;
  }
}

export async function clearAnonymousId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANONYMOUS_ID_KEY);
    Logger.debug('[Anonymous] ID cleared');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Native module is null')) {
      Logger.warn('[Anonymous] AsyncStorage not available yet, skipping clear');
      return;
    }
    Logger.error('[Anonymous] Failed to clear ID:', error);
    throw new Error('Failed to clear anonymous ID');
  }
}

export async function getOrCreateAnonymousId(): Promise<AnonymousId> {
  const existing = await loadAnonymousId();
  if (existing) {
    return existing;
  }

  const newId = generateAnonymousId();
  try {
    await saveAnonymousId(newId);
  } catch {
    Logger.warn('[Anonymous] Could not persist ID, using in-memory only');
  }
  return newId;
}

let cachedAnonymousId: AnonymousId | null | undefined = undefined;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return cachedAnonymousId;
}

export async function initializeAnonymousId(): Promise<void> {
  const id = await getOrCreateAnonymousId();
  cachedAnonymousId = id;
  notifyListeners();
}

export function useAnonymousId(): AnonymousId | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useIsAnonymous(): boolean {
  const id = useAnonymousId();
  return typeof id === 'string' && id.length > 0;
}

export async function clearAnonymousIdWithCache(): Promise<void> {
  await clearAnonymousId();
  cachedAnonymousId = null;
  notifyListeners();
}
