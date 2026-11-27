// lib/rate-limit.ts

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { config } from '@/lib/config'

/**
 * Initialisation paresseuse : Redis et Ratelimit ne sont instanciés
 * qu'au premier appel réel (runtime), pas au moment de l'import.
 * Cela permet au build Next.js de passer même si les variables
 * d'environnement Redis ne sont pas disponibles pendant la collecte
 * des données (ce qui est le cas sur Vercel).
 */

let redisInstance: Redis | null = null
let anonymousLimiterInstance: Ratelimit | null = null
let authenticatedLimiterInstance: Ratelimit | null = null

function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    })
  }
  return redisInstance
}

export function getAnonymousLimiter(): Ratelimit {
  if (!anonymousLimiterInstance) {
    anonymousLimiterInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(
        config.rateLimit.anonymousPerMinute,
        '1 m'
      ),
      analytics: true,
      prefix: 'ratelimit:anon',
    })
  }
  return anonymousLimiterInstance
}

export function getAuthenticatedLimiter(): Ratelimit {
  if (!authenticatedLimiterInstance) {
    authenticatedLimiterInstance = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(
        config.rateLimit.authenticatedPerMinute,
        '1 m'
      ),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  }
  return authenticatedLimiterInstance
}

/**
 * Extrait l'IP réelle du client (derrière Vercel).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}