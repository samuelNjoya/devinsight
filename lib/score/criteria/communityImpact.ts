// lib/score/criteria/communityImpact.ts

import type { ScoreCriterion } from '../types'

/**
 * Impact communautaire : basé sur le total de stars.
 * On utilise log10 pour éviter qu'un repo viral (10k stars) écrase tout.
 * log10(1 + stars) normalisé sur 4 → 0 stars = 0, 10000 stars = 100.
 */
export const communityImpact: ScoreCriterion = {
  id: 'communityImpact',
  weight: 0.3,
  compute(data) {
    const totalStars = data.repos.reduce((sum, repo) => sum + repo.stars, 0)
    const normalized = Math.log10(1 + totalStars) / 4
    return clamp(normalized * 100)
  },
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n))
}