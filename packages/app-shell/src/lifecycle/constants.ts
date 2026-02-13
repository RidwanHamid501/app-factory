// Lifecycle Constants

// Duration threshold for warm start detection
// If app is backgrounded longer than this, next foreground is a "warm start" and starts a new session
// Default: 30 minutes (change to 30000 for testing = 30 seconds)
export const MAX_BACKGROUND_DURATION_MS = 30 * 60 * 1000;
