// app/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Entre un username GitHub')
      return
    }
    // Validation basique côté client, la vraie validation est serveur
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(trimmed)) {
      setError('Username GitHub invalide')
      return
    }
    router.push(`/u/${trimmed}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">DevInsight</h1>
        <p className="mt-2 text-gray-500">
          Analyse ton profil GitHub en un clic
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setError(null)
          }}
          placeholder="username GitHub (ex: octocat)"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
          aria-label="Username GitHub"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-white hover:bg-gray-800"
        >
          Analyser
        </button>
      </form>

      <a href="/login" className="text-sm text-blue-600 hover:underline">
        Ou connecte-toi avec GitHub pour accéder aux dépôts privés
      </a>
    </main>
  )
}