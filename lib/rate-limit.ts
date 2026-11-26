// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from '@/lib/config'

/**
 * Rate limiting avec Upstash.
 * Deux limiteurs : anonyme (par IP) et authentifié (par user ID).
 */
const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
})

/**
 * Limiteur pour visiteurs non connectés : 20 req/min par IP.
 */
export const anonymousLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(config.rateLimit.anonymousPerMinute, '1 m'),
  analytics: true,
  prefix: 'ratelimit:anon',
})

/**
 * Limiteur pour utilisateurs connectés : 60 req/min par user ID.
 */
export const authenticatedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(config.rateLimit.authenticatedPerMinute, '1 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
})

/**
 * Extrait l'IP réelle du client (derrière Vercel).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}