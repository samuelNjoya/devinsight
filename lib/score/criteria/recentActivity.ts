// // lib/score/criteria/recentActivity.ts

// import type { ScoreCriterion } from '../types'

// const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
// const MAX_EVENTS_FOR_FULL_SCORE = 100

// /**
//  * Activité récente : nombre d'events GitHub sur les 90 derniers jours.
//  * 0 events = 0, 100+ events = 100 (linéaire, plafonné).
//  */
// export const recentActivity: ScoreCriterion = {
//   id: 'recentActivity',
//   weight: 0.25,
//   compute(data) {
//     const cutoff = Date.now() - NINETY_DAYS_MS
//     const recentCount = data.events.filter(
//       (event) => new Date(event.createdAt).getTime() >= cutoff
//     ).length
//     const score = (recentCount / MAX_EVENTS_FOR_FULL_SCORE) * 100
//     return Math.max(0, Math.min(100, score))
//   },
// }

// lib/score/criteria/recentActivity.ts

import type { ScoreCriterion } from '../types'
import type { ProfileData } from '@/lib/github/types'

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const MAX_EVENTS_FOR_FULL_SCORE = 100

/**
 * Activité récente : nombre d'events GitHub sur les 90 derniers jours.
 * `now` est injectable pour rendre la fonction déterministe en test
 * et compatible avec le prerender Next.js (pas de Date.now() implicite).
 */
export function createRecentActivityCriterion(
  now: () => number = () => Date.now()
): ScoreCriterion {
  return {
    id: 'recentActivity',
    weight: 0.25,
    compute(data: ProfileData) {
      const cutoff = now() - NINETY_DAYS_MS
      const recentCount = data.events.filter(
        (event) => new Date(event.createdAt).getTime() >= cutoff
      ).length
      const score = (recentCount / MAX_EVENTS_FOR_FULL_SCORE) * 100
      return Math.max(0, Math.min(100, score))
    },
  }
}

/** Instance par défaut, utilisée en production */
export const recentActivity = createRecentActivityCriterion()