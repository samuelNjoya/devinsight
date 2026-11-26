// lib/score/calculate.ts

import type { ProfileData } from '@/lib/github/types'
import type { ScoreCriterion, ScoreResult } from './types'
import { communityImpact } from './criteria/communityImpact'
import { recentActivity } from './criteria/recentActivity'
import { repoQuality } from './criteria/repoQuality'
import { languageDiversity } from './criteria/languageDiversity'
import { profileCompleteness } from './criteria/profileCompleteness'

/**
 * Liste des critères. Ajouter un critère = ajouter une ligne ici.
 * Les poids DOIVENT sommer à 1.0 (vérifié au build via test).
 */
export const CRITERIA: readonly ScoreCriterion[] = [
  communityImpact,
  recentActivity,
  repoQuality,
  languageDiversity,
  profileCompleteness,
]

/**
 * Calcule le score final d'un profil.
 * Fonction PURE : aucune dépendance externe, aucune mutation, testable sans mock.
 */
export function calculateScore(data: ProfileData): ScoreResult {
  const breakdown = CRITERIA.map((criterion) => {
    const rawScore = criterion.compute(data)
    return {
      criterionId: criterion.id,
      rawScore,
      weight: criterion.weight,
      weightedScore: rawScore * criterion.weight,
    }
  })

  const totalRaw = breakdown.reduce((sum, item) => sum + item.weightedScore, 0)

  return {
    total: Math.round(totalRaw),
    breakdown,
  }
}