// app/api/github/[username]/route.ts

import { NextResponse } from 'next/server'
import { GitHubClient } from '@/lib/github/client'
import { aggregateProfile } from '@/lib/github/aggregator'
import { calculateScore } from '@/lib/score/calculate'
import { getCache, cacheKeys } from '@/lib/cache/redis'
import { validateUsername } from '@/lib/validation/username'
import { createClient } from '@/lib/supabase/server'
import { anonymousLimiter, authenticatedLimiter, getClientIp } from '@/lib/rate-limit'
import { AppError } from '@/lib/errors'
import { config } from '@/lib/config'
import type { ProfileData } from '@/lib/github/types'
import type { ScoreResult } from '@/lib/score/types'

interface ProfileResponse {
  profile: ProfileData
  score: ScoreResult
  fromCache: boolean
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // 1. Extraire et valider le username
    const { username } = await params
    const validation = validateUsername(username)

    if (!validation.ok) {
      return NextResponse.json(
        { error: 'INVALID_USERNAME', message: validation.error },
        { status: 400 }
      )
    }

    // 2. Identifier l'appelant (connecté ou anonyme) pour le rate limit
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 3. Rate limiting
    const identifier = user?.id ?? getClientIp(request)
    const limiter = user ? authenticatedLimiter : anonymousLimiter
    const { success, reset } = await limiter.limit(identifier)

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Trop de requêtes. Réessaie dans ${retryAfter}s.`,
          retryAfter,
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    // 4. Déterminer le token GitHub à utiliser
    //    - Si connecté ET a un provider_token stocké → utiliser ce token (dépôts privés inclus)
    //    - Sinon → fallback GITHUB_TOKEN serveur (profils publics uniquement)
    let providerToken: string | undefined
    let includePrivate = false

    if (user) {
      const { data: tokenRow } = await supabase
        .from('user_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', 'github')
        .maybeSingle()

      if (tokenRow?.access_token) {
        providerToken = tokenRow.access_token
        includePrivate = true
      }
    }

    // 5. Cache Redis (clé inclut includePrivate pour ne pas mélanger)
    const cache = getCache()
    const cacheKey = cacheKeys.profile(validation.value, includePrivate)

    const cached = await cache.get<ProfileResponse>(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }

    // 6. Appel GitHub (client avec token utilisateur ou fallback serveur)
    // const client = new GitHubClient({ token: providerToken })
    const client = new GitHubClient(providerToken ? { token: providerToken } : {})
    const profile = await aggregateProfile(client, validation.value, {
      includePrivate,
    })

    // 7. Calcul du score (fonction pure, rapide)
    const score = calculateScore(profile)

    const result: ProfileResponse = { profile, score, fromCache: false }

    // 8. Mise en cache (TTL 1h)
    await cache.set(cacheKey, result, config.github.cacheTtlSeconds)

    return NextResponse.json(result)
  } catch (error) {
    // Gestion typée des erreurs
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode }
      )
    }

    console.error('[api/github] unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Une erreur inattendue est survenue.' },
      { status: 500 }
    )
  }
}