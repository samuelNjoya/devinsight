// lib/cache/redis.ts

import { Redis } from '@upstash/redis'
import { config } from '@/lib/config'
import { CacheError } from '@/lib/errors'
import type { CacheStore } from './types'

/**
 * Implémentation Upstash du CacheStore.
 * Upstash est HTTP-based → compatible Edge/serverless.
 */
export class RedisCacheStore implements CacheStore {
  private readonly redis: Redis

  constructor() {
    this.redis = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get<T>(key)
      return value ?? null
    } catch (error) {
      // Cache indisponible = on ne casse PAS l'app, on log et retourne null.
      // Le caller fera l'appel GitHub directement (graceful degradation).
      console.error(`[cache] get failed for ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, value, { ex: ttlSeconds })
    } catch (error) {
      // Idem : le cache est une optimisation, pas une dépendance critique.
      console.error(`[cache] set failed for ${key}:`, error)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error(`[cache] delete failed for ${key}:`, error)
    }
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const fresh = await fetcher()
    await this.set(key, fresh, ttlSeconds)
    return fresh
  }
}

/**
 * Singleton — une seule instance Redis pour tout le process.
 */
let instance: RedisCacheStore | null = null

export function getCache(): CacheStore {
  if (!instance) {
    instance = new RedisCacheStore()
  }
  return instance
}

/**
 * Clés de cache typées (pas de string magic éparpillée).
 */
export const cacheKeys = {
  user: (username: string) => `github:user:${username.toLowerCase()}`,
  repos: (username: string, includePrivate: boolean) =>
    `github:repos:${username.toLowerCase()}:${includePrivate ? 'all' : 'public'}`,
  events: (username: string) => `github:events:${username.toLowerCase()}`,
  profile: (username: string, includePrivate: boolean) =>
    `devinsight:profile:${username.toLowerCase()}:${includePrivate ? 'all' : 'public'}`,
} as const