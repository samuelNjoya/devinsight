
// // lib/score/criteria/recentActivity.ts

// import type { ScoreCriterion } from '../types'
// import type { ProfileData } from '@/lib/github/types'

// const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
// const MAX_EVENTS_FOR_FULL_SCORE = 100

// /**
//  * Activité récente : nombre d'events GitHub sur les 90 derniers jours.
//  * `now` est injectable pour rendre la fonction déterministe en test
//  * et compatible avec le prerender Next.js (pas de Date.now() implicite).
//  */
// export function createRecentActivityCriterion(
//   now: () => number = () => Date.now()
// ): ScoreCriterion {
//   return {
//     id: 'recentActivity',
//     weight: 0.25,
//     compute(data: ProfileData) {
//       const cutoff = now() - NINETY_DAYS_MS
//       const recentCount = data.events.filter(
//         (event) => new Date(event.createdAt).getTime() >= cutoff
//       ).length
//       const score = (recentCount / MAX_EVENTS_FOR_FULL_SCORE) * 100
//       return Math.max(0, Math.min(100, score))
//     },
//   }
// }

// /** Instance par défaut, utilisée en production */
// export const recentActivity = createRecentActivityCriterion()

// lib/score/criteria/recentActivity.ts — modifier

import type { ScoreCriterion } from '../types'
import type { ProfileData } from '@/lib/github/types'

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const MAX_CONTRIBUTIONS_FOR_FULL_SCORE = 100

export function createRecentActivityCriterion(
  now: () => number = () => Date.now()
): ScoreCriterion {
  return {
    id: 'recentActivity',
    weight: 0.25,
    compute(data: ProfileData) {
      const cutoff = now() - NINETY_DAYS_MS
      const recentCount = data.contributions.days.filter(
        (day) => new Date(day.date).getTime() >= cutoff
      ).reduce((sum, day) => sum + day.count, 0)

      const score = (recentCount / MAX_CONTRIBUTIONS_FOR_FULL_SCORE) * 100
      return Math.max(0, Math.min(100, score))
    },
  }
}

export const recentActivity = createRecentActivityCriterion()