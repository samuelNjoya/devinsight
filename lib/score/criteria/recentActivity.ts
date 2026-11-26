// lib/score/criteria/recentActivity.ts

import type { ScoreCriterion } from '../types'

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const MAX_EVENTS_FOR_FULL_SCORE = 100

/**
 * Activité récente : nombre d'events GitHub sur les 90 derniers jours.
 * 0 events = 0, 100+ events = 100 (linéaire, plafonné).
 */
export const recentActivity: ScoreCriterion = {
  id: 'recentActivity',
  weight: 0.25,
  compute(data) {
    const cutoff = Date.now() - NINETY_DAYS_MS
    const recentCount = data.events.filter(
      (event) => new Date(event.createdAt).getTime() >= cutoff
    ).length
    const score = (recentCount / MAX_EVENTS_FOR_FULL_SCORE) * 100
    return Math.max(0, Math.min(100, score))
  },
}