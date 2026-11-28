// lib/github/client.ts

import { config } from '@/lib/config'
import {
  AppError,
  GitHubAuthError,
  GitHubNotFoundError,
  GitHubRateLimitError,
  GitHubServerError,
} from '@/lib/errors'
import type {
  GitHubEventSummary,
  GitHubRepoSummary,
  GitHubUserSummary,
} from './types'

/**
 * Client GitHub bas niveau.
 * - Gère le token (passé en argument, ou fallback config)
 * - Gère timeout + retry
 * - Mappe les erreurs HTTP en erreurs typées
 * - Ne fait AUCUNE agrégation métier (c'est le rôle de l'aggregator)
 */

interface GitHubRequestOptions {
  /** Token OAuth de l'utilisateur connecté, sinon fallback GITHUB_TOKEN */
  token?: string | undefined
  /** Timeout custom (ms) */
  timeoutMs?: number | undefined
}

export class GitHubClient {
  constructor(private readonly options: GitHubRequestOptions = {}) { }

  /**
   * Fetch bas niveau avec timeout + retry + mapping d'erreurs.
   */
  private async request<T>(path: string, attempt = 0): Promise<T> {
    const token = this.options.token ?? config.github.token
    const url = `${config.github.apiBaseUrl}${path}`
    const timeoutMs = this.options.timeoutMs ?? config.github.requestTimeoutMs

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
        // Cache Next.js désactivé : on gère le cache nous-mêmes via Redis
        cache: 'no-store',
      })

      if (response.ok) {
        return (await response.json()) as T
      }

      // Gestion typée des erreurs HTTP
      if (response.status === 404) {
        throw new GitHubNotFoundError(path)
      }
      if (response.status === 401) {
        throw new GitHubAuthError()
      }
      if (response.status === 403 || response.status === 429) {
        // GitHub utilise 403 pour le rate limit ET pour l'accès refusé.
        // On distingue via le header X-RateLimit-Remaining.
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const resetAt = response.headers.get('X-RateLimit-Reset')
        if (remaining === '0' && resetAt) {
          const retryAfter = Math.max(
            1,
            Math.ceil(Number(resetAt) - Date.now() / 1000)
          )
          throw new GitHubRateLimitError(retryAfter)
        }
        // 403 sans rate limit = accès refusé (repo privé sans scope, etc.)
        throw new GitHubAuthError()
      }
      if (response.status >= 500) {
        // Retry exponentiel sur 5xx
        if (attempt < config.github.maxRetries) {
          const backoffMs = 2 ** attempt * 500
          await new Promise((r) => setTimeout(r, backoffMs))
          return this.request<T>(path, attempt + 1)
        }
        throw new GitHubServerError(response.status)
      }
      throw new GitHubServerError(response.status)
    } catch (error) {
      if (error instanceof AppError) throw error
      // AbortError = timeout, ou erreur réseau
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt < config.github.maxRetries) {
          const backoffMs = 2 ** attempt * 500
          await new Promise((r) => setTimeout(r, backoffMs))
          return this.request<T>(path, attempt + 1)
        }
        throw new GitHubServerError(408)
      }
      throw new GitHubServerError(0)
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Récupère un utilisateur GitHub et le mappe vers notre type domaine.
   */
  async getUser(username: string): Promise<GitHubUserSummary> {
    const raw = await this.request<RawGitHubUser>(`/users/${username}`)
    return mapUser(raw)
  }

  /**
   * Récupère les repos d'un utilisateur (100 max, triés par updated).
   * Note : l'API GitHub pagine à 30 par défaut, on demande 100.
   */
  async getRepos(
    username: string,
    options: { includePrivate: boolean } = { includePrivate: false }
  ): Promise<readonly GitHubRepoSummary[]> {
    const raw = await this.request<RawGitHubRepo[]>(
      `/users/${username}/repos?per_page=100&sort=updated&type=${options.includePrivate ? 'all' : 'owner'}`
    )
    return raw
      .filter((repo) => options.includePrivate || !repo.private)
      .map(mapRepo)
  }

  /**
   * Récupère les events publics récents (max 300, 90 jours).
   * Note : /events ne renvoie que les events publics, même avec un token.
   */
  // async getEvents(username: string): Promise<readonly GitHubEventSummary[]> {
  //   const raw = await this.request<RawGitHubEvent[]>(
  //     `/users/${username}/events/public?per_page=100`
  //   )
  //   return raw.map((e) => ({ type: e.type, createdAt: e.created_at }))
  // }
  async getEvents(username: string): Promise<readonly GitHubEventSummary[]> {
    // Utiliser /events (sans /public) si un token est disponible
    // Sinon /events/public pour les visiteurs anonymes
    const path = this.options.token
      ? `/users/${username}/events?per_page=100`
      : `/users/${username}/events/public?per_page=100`

    const raw = await this.request<RawGitHubEvent[]>(path)
    return raw.map((e) => ({ type: e.type, createdAt: e.created_at }))
  }
}

// ─────────────────────────────────────────────────────────────
// Mapping types bruts GitHub → types domaine
// ─────────────────────────────────────────────────────────────

interface RawGitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  html_url: string
}

interface RawGitHubRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  private: boolean
  has_wiki: boolean
  license: { key: string } | null
  topics: string[]
  updated_at: string
  html_url: string
}

interface RawGitHubEvent {
  type: string
  created_at: string
}

function mapUser(raw: RawGitHubUser): GitHubUserSummary {
  return {
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    company: raw.company,
    location: raw.location,
    blog: raw.blog,
    publicRepos: raw.public_repos,
    followers: raw.followers,
    following: raw.following,
    createdAt: raw.created_at,
    htmlUrl: raw.html_url,
  }
}

function mapRepo(raw: RawGitHubRepo): GitHubRepoSummary {
  return {
    name: raw.name,
    description: raw.description,
    language: raw.language,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    isPrivate: raw.private,
    // Note : l'API list repos ne dit pas si un README existe.
    // On considère qu'un repo récent (updated < 1 an) a un README.
    // Amélioration future : appel /repos/{owner}/{repo}/readme par repo (coûteux).
    hasReadme: Boolean(raw.description),
    hasLicense: raw.license !== null,
    topics: raw.topics ?? [],
    updatedAt: raw.updated_at,
    htmlUrl: raw.html_url,
  }
}