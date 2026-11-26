// lib/github/types.ts

/**
 * Types du domaine DevInsight.
 * Ces types sont volontairement DÉCOUPLÉS des types bruts de l'API GitHub.
 * Règle : un composant UI ne doit jamais recevoir un objet GitHub brut.
 */

export interface GitHubUserSummary {
  readonly login: string
  readonly name: string | null
  readonly avatarUrl: string
  readonly bio: string | null
  readonly company: string | null
  readonly location: string | null
  readonly blog: string | null
  readonly publicRepos: number
  readonly followers: number
  readonly following: number
  readonly createdAt: string
  readonly htmlUrl: string
}

export interface GitHubRepoSummary {
  readonly name: string
  readonly description: string | null
  readonly language: string | null
  readonly stars: number
  readonly forks: number
  readonly isPrivate: boolean
  readonly hasReadme: boolean
  readonly hasLicense: boolean
  readonly topics: readonly string[]
  readonly updatedAt: string
  readonly htmlUrl: string
}

export interface GitHubEventSummary {
  readonly type: string
  readonly createdAt: string
}

/**
 * Agrégat prêt à être consommé par le calculateur de score et l'UI.
 * C'est LE type central du domaine.
 */
export interface ProfileData {
  readonly user: GitHubUserSummary
  readonly repos: readonly GitHubRepoSummary[]
  readonly events: readonly GitHubEventSummary[]
  readonly languages: Readonly<Record<string, number>>
  /** true si l'analyse a utilisé un token OAuth (dépôts privés inclus) */
  readonly includesPrivate: boolean
  /** Timestamp ISO de l'analyse */
  readonly analyzedAt: string
}