const SESSION_KEY = 'anonymous_session_id';

export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'anonymous-' + Math.random().toString(36).substring(7);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}
