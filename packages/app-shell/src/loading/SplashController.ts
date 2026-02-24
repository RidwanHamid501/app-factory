import { Logger } from '../utils/logger';
import type { SplashOptions } from './types';

let bootsplashInstance: any = null;
let splashHidden = false;

// Initialize bootsplash reference - Official docs: https://github.com/zoontek/react-native-bootsplash
function getBootsplash() {
  if (!bootsplashInstance) {
    try {
      bootsplashInstance = require('react-native-bootsplash');
    } catch (error) {
      Logger.warn('[SplashController] react-native-bootsplash not installed');
      bootsplashInstance = null;
    }
  }
  return bootsplashInstance;
}

// Hide splash screen with animation - Official docs: https://github.com/zoontek/react-native-bootsplash#hide
export async function hideSplash(options: SplashOptions = {}): Promise<void> {
  if (splashHidden) {
    Logger.debug('[SplashController] Splash already hidden');
    return;
  }

  const bootsplash = getBootsplash();
  if (!bootsplash) {
    Logger.debug('[SplashController] Bootsplash not available');
    splashHidden = true;
    return;
  }

  try {
    await bootsplash.hide({
      fade: options.fade ?? true,
      duration: options.duration ?? 250,
    });
    splashHidden = true;
    Logger.info('[SplashController] Splash hidden successfully');
  } catch (error) {
    Logger.error('[SplashController] Failed to hide splash:', error);
    splashHidden = true;
  }
}

// Check if splash is currently visible - Official docs: https://github.com/zoontek/react-native-bootsplash#isvisible
// Note: isVisible() is synchronous in v7.x
export function isSplashVisible(): boolean {
  const bootsplash = getBootsplash();
  if (!bootsplash) {
    return false;
  }

  try {
    return bootsplash.isVisible();
  } catch (error) {
    Logger.error('[SplashController] Failed to check splash visibility:', error);
    return false;
  }
}

export function __resetSplashForTesting(): void {
  bootsplashInstance = null;
  splashHidden = false;
}
