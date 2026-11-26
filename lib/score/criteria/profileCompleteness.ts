// lib/score/criteria/profileCompleteness.ts

import type { ScoreCriterion } from '../types'

/**
 * Complétude du profil : 3 éléments qui discriminent VRAIMENT.
 * L'avatar est exclu car GitHub en fournit toujours un (par défaut),
 * donc il n'apporte aucune information sur la complétude réelle.
 */
export const profileCompleteness: ScoreCriterion = {
  id: 'profileCompleteness',
  weight: 0.1,
  compute(data) {
    const checks = [
      Boolean(data.user.bio),
      Boolean(data.user.blog),
      Boolean(data.user.name),
    ]
    return (checks.filter(Boolean).length / checks.length) * 100
  },
}