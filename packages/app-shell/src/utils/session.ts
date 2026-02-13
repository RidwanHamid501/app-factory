// Session Utility - Generate unique session IDs

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomStr}`;
}
