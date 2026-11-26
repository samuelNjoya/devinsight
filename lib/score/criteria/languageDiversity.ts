// lib/score/criteria/languageDiversity.ts

import type { ScoreCriterion } from '../types'

const TARGET_LANGUAGE_COUNT = 8

/**
 * Diversité technique : nombre de langages distincts utilisés.
 * 0 langage = 0, 8+ langages = 100.
 * Note : un dev frontend mono-langage n'est PAS pénalisé outre mesure
 * car ce critère ne pèse que 15%.
 */
export const languageDiversity: ScoreCriterion = {
  id: 'languageDiversity',
  weight: 0.15,
  compute(data) {
    const distinctLanguages = Object.keys(data.languages).length
    const score = (distinctLanguages / TARGET_LANGUAGE_COUNT) * 100
    return Math.min(100, score)
  },
}