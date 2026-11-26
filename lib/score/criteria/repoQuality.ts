// lib/score/criteria/repoQuality.ts

import type { ScoreCriterion } from '../types'

const MAX_REPOS_TO_EVALUATE = 10

/**
 * Qualité des repos : sur les 10 repos les plus récents,
 * pourcentage de repos "complets" (description + README + license + topics).
 * Chaque repo complet vaut 100, incomplet vaut 0, on moyenne.
 */
export const repoQuality: ScoreCriterion = {
  id: 'repoQuality',
  weight: 0.2,
  compute(data) {
    if (data.repos.length === 0) return 0

    const recent = [...data.repos]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_REPOS_TO_EVALUATE)

    const completeCount = recent.filter(isRepoComplete).length
    return (completeCount / recent.length) * 100
  },
}

function isRepoComplete(repo: { description: string | null; hasReadme: boolean; hasLicense: boolean; topics: readonly string[] }): boolean {
  return Boolean(repo.description) && repo.hasReadme && repo.hasLicense && repo.topics.length > 0
}