// lib/github/aggregator.ts

import type { GitHubClient } from './client'
import type {
  GitHubEventSummary,
  GitHubRepoSummary,
  GitHubUserSummary,
  ProfileData,
} from './types'

/**
 * Agrège user + repos + events en un ProfileData.
 * Parallélise les 3 appels (Promise.all) → ~3x plus rapide.
 */
export async function aggregateProfile(
  client: GitHubClient,
  username: string,
  options: { includePrivate: boolean }
): Promise<ProfileData> {
  const [user, repos, events] = await Promise.all([
    client.getUser(username),
    client.getRepos(username, { includePrivate: options.includePrivate }),
    client.getEvents(username),
  ])

  return {
    user,
    repos,
    events,
    languages: computeLanguages(repos),
    includesPrivate: options.includePrivate,
    analyzedAt: new Date().toISOString(),
  }
}

/**
 * Calcule la répartition des langages à partir des repos.
 * Fonction pure, exportée pour les tests.
 */
export function computeLanguages(
  repos: readonly GitHubRepoSummary[]
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const repo of repos) {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] ?? 0) + 1
    }
  }
  return counts
}