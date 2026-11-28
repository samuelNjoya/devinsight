// lib/score/criteria/repoQuality.ts

// import type { ScoreCriterion } from '../types'

// const MAX_REPOS_TO_EVALUATE = 10

/**
 * Qualité des repos : sur les 10 repos les plus récents,
 * pourcentage de repos "complets" (description + README + license + topics).
 * Chaque repo complet vaut 100, incomplet vaut 0, on moyenne.
 */
// export const repoQuality: ScoreCriterion = {
//   id: 'repoQuality',
//   weight: 0.2,
//   compute(data) {
//     if (data.repos.length === 0) return 0

//     const recent = [...data.repos]
//       .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
//       .slice(0, MAX_REPOS_TO_EVALUATE)

//     const completeCount = recent.filter(isRepoComplete).length
//     return (completeCount / recent.length) * 100
//   },
// }

// function isRepoComplete(repo: { description: string | null; hasReadme: boolean; hasLicense: boolean; topics: readonly string[] }): boolean {
//   return Boolean(repo.description) && repo.hasReadme && repo.hasLicense && repo.topics.length > 0
// }

// lib/score/criteria/repoQuality.ts

import type { ScoreCriterion } from '../types'
import type { GitHubRepoSummary } from '@/lib/github/types'

const MAX_REPOS_TO_EVALUATE = 10

/**
 * Qualité des repos : sur les 10 repos les plus récents,
 * on compte combien d'éléments de qualité sont présents
 * parmi : description, README, license, topics.
 *
 * Un repo avec 2/4 éléments vaut 50, pas 0.
 * C'est plus tolérant et plus représentatif de la réalité
 * (beaucoup de bons projets n'ont pas de license ni de topics).
 */
export const repoQuality: ScoreCriterion = {
  id: 'repoQuality',
  weight: 0.2,
  compute(data) {
    if (data.repos.length === 0) return 0

    const recent = [...data.repos]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, MAX_REPOS_TO_EVALUATE)

    // Pour chaque repo, on compte les éléments présents sur 4
    const scores = recent.map((repo) => countQualitySignals(repo) / 4)

    // Moyenne des scores (0 à 1), puis × 100
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
    return average * 100
  },
}

/**
 * Compte le nombre d'éléments de qualité présents (0 à 4).
 * - description non vide
 * - README détecté
 * - license présente
 * - topics non vide
 */
function countQualitySignals(repo: GitHubRepoSummary): number {
  let count = 0
  if (repo.description && repo.description.trim().length > 0) count++
  if (repo.hasReadme) count++
  if (repo.hasLicense) count++
  if (repo.topics.length > 0) count++
  return count
}