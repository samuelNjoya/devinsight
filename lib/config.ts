// lib/config.ts

/**
 * Configuration centralisée.
 * Aucun process.env ne doit être lu ailleurs que dans ce fichier.
 * Fail fast : si une variable requise manque, on throw au démarrage.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`)
  }
  return value
}

export const config = {
  github: {
    /** Token serveur (fallback quand l'user n'est pas connecté) */
    get token(): string | undefined {
      return process.env.GITHUB_TOKEN
    },
    apiBaseUrl: 'https://api.github.com',
    /** TTL du cache Redis en secondes (1h) */
    cacheTtlSeconds: 3600,
    /** Timeout des requêtes fetch (ms) */
    requestTimeoutMs: 8000,
    /** Nombre max de tentatives en cas d'erreur réseau/5xx */
    maxRetries: 2,
  },
  redis: {
    get url(): string {
      return requireEnv('UPSTASH_REDIS_REST_URL')
    },
    get token(): string {
      return requireEnv('UPSTASH_REDIS_REST_TOKEN')
    },
  },
  supabase: {
    get url(): string {
      return requireEnv('NEXT_PUBLIC_SUPABASE_URL')
    },
    get anonKey(): string {
      return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    },
    get serviceRoleKey(): string {
      return requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    },
  },
  rateLimit: {
    /** Requêtes anonymes par IP par minute */
    anonymousPerMinute: 20,
    /** Requêtes connectées par user par minute */
    authenticatedPerMinute: 60,
  },
} as const