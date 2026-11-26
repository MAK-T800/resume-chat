// lib/rateLimit.ts
// Simple in-memory limiters. Good enough for a resume site.
// For scale, swap to Upstash Redis later.

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_PER_WINDOW = 20;        // per IP

const DAILY_MAX = 300;            // global Gemini requests per day
let dailyCount = 0;
let dailyResetAt = Date.now() + 24 * 60 * 60 * 1000;

export function checkIp(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || now > b.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

export function checkDaily(): { ok: boolean } {
  const now = Date.now();
  if (now > dailyResetAt) {
    dailyCount = 0;
    dailyResetAt = now + 24 * 60 * 60 * 1000;
  }
  if (dailyCount >= DAILY_MAX) return { ok: false };
  dailyCount += 1;
  return { ok: true };
}
