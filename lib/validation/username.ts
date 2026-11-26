// lib/validation/username.ts

import { z } from 'zod'

/**
 * Règles officielles GitHub pour un username :
 * - 1 à 39 caractères
 * - commence par une lettre ou un chiffre
 * - peut contenir des tirets, mais pas en début/fin, ni consécutifs
 * - alphanumérique uniquement (pas de underscore, pas de point)
 */
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export const usernameSchema = z
  .string()
  .trim()
  .min(1, 'Username requis')
  .max(39, 'Username trop long (max 39 caractères)')
  .regex(GITHUB_USERNAME_REGEX, 'Username GitHub invalide')

export type ValidUsername = z.infer<typeof usernameSchema>

/**
 * Valide un username et retourne un résultat discriminé.
 * Ne throw jamais : le caller décide quoi faire de l'erreur.
 */
export function validateUsername(
  input: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  const result = usernameSchema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Username invalide' }
  }
  return { ok: true, value: result.data }
}