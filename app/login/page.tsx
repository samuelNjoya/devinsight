// app/login/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInWithGitHub() {
    setLoading(true)
    setError(null)
    // Instanciation AU CLIC uniquement (évite le crash au prerender)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user repo',
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem-5rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12l4-4 4 4 4-4 4 4" />
              <path d="M3 18l4-4 4 4 4-4 4 4" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Connexion à DevInsight</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Connecte-toi avec GitHub pour accéder aux dépôts privés et sauvegarder tes profils.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <Button
              onClick={signInWithGitHub}
              loading={loading}
              size="lg"
              className="w-full"
            >
              <GitHubIcon />
              {loading ? 'Redirection...' : 'Continuer avec GitHub'}
            </Button>

            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              En continuant, tu acceptes que DevInsight accède à tes informations
              publiques GitHub.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2 0 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}