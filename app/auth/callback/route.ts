// app/auth/callback/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Callback OAuth GitHub.
 * 1. Échange le code contre une session Supabase
 * 2. Stocke le provider_token GitHub en DB (car Supabase ne le persiste pas)
 * 3. Redirige vers le dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()

  // Échange le code OAuth contre une session Supabase
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('[auth/callback] exchange failed:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { session } = data
  const providerToken = session.provider_token

  // CRITIQUE : stocker le provider_token immédiatement
  // car Supabase ne le conserve pas au-delà de cette requête
  if (providerToken) {
    const admin = await createAdminClient()
    const { error: upsertError } = await admin
      .from('user_tokens')
      .upsert(
        {
          user_id: session.user.id,
          provider: 'github',
          access_token: providerToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      )

    if (upsertError) {
      console.error('[auth/callback] failed to store provider_token:', upsertError)
      // Non bloquant : l'user est connecté, mais sans token GitHub
      // Il pourra quand même utiliser l'analyse publique (fallback GITHUB_TOKEN serveur)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}