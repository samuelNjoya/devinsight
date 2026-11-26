// lib/score/types.ts

import type { ProfileData } from '@/lib/github/types'

/**
 * Un critère de score implémente cette interface.
 * Open/Closed : ajouter un critère = créer un fichier qui implémente
 * cette interface, sans toucher au calculateur.
 */
export interface ScoreCriterion {
  /** Identifiant stable, utilisé pour le radar chart et l'i18n */
  readonly id: string
  /** Poids du critère. La somme de tous les poids doit valoir 1.0 */
  readonly weight: number
  /** Calcule un score normalisé entre 0 et 100 pour ce critère */
  compute(data: ProfileData): number
}

export interface ScoreBreakdown {
  readonly criterionId: string
  readonly rawScore: number // 0-100
  readonly weight: number
  readonly weightedScore: number // rawScore * weight
}

export interface ScoreResult {
  /** Score final 0-100, arrondi à l'entier */
  readonly total: number
  /** Détail par critère, pour affichage transparent (radar chart) */
  readonly breakdown: readonly ScoreBreakdown[]
}