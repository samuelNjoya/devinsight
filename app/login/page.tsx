// app/login/page.tsx

'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function signInWithGitHub() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user repo',
      },
    })

    if (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-6 text-3xl font-bold">DevInsight</h1>
        <p className="mb-8 text-gray-600">
          Connecte-toi avec GitHub pour analyser ton profil
        </p>
        <button
          onClick={signInWithGitHub}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Redirection...' : 'Continuer avec GitHub'}
        </button>
      </div>
    </main>
  )
}