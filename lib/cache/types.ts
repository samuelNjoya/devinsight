// lib/cache/types.ts

/**
 * Interface du cache.
 * Le reste de l'app dépend de cette interface, pas d'Upstash directement.
 * Permet de mocker le cache en test, ou de changer d'implémentation.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  /**
   * Pattern cache-aside : retourne la valeur cachée si elle existe,
   * sinon appelle le fetcher, stocke le résultat, et le retourne.
   */
  getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T>
}