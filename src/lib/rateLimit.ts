interface Attempt {
  count: number;
  lockedUntil: number | null;
  firstAttempt: number;
}

const store = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (entry?.lockedUntil) {
    if (now < entry.lockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
    }
    store.delete(ip);
  }

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(ip, { count: 1, lockedUntil: null, firstAttempt: now });
    return { allowed: true };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfter: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true };
}

export function resetRateLimit(ip: string) {
  store.delete(ip);
}
