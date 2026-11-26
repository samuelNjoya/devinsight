// app/dashboard/saved/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface SavedProfile {
  id: string
  github_username: string
  score: number
  created_at: string
}

export default async function SavedProfilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profiles, error } = await supabase
    .from('saved_profiles')
    .select('id, github_username, score, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-6 text-red-600">Erreur : {error.message}</p>
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Mes profils sauvegardés</h1>

      {(!profiles || profiles.length === 0) ? (
        <p className="mt-4 text-gray-500">
          Aucun profil sauvegardé. Analyse un profil et clique sur &quot;Sauvegarder&quot;.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {profiles.map((p: SavedProfile) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
            >
              <div>
                <Link
                  href={`/u/${p.github_username}`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  @{p.github_username}
                </Link>
                <p className="text-sm text-gray-500">
                  Score : {p.score} — {new Date(p.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Link
                href={`/dashboard/compare?a=${p.github_username}`}
                className="text-sm text-gray-600 hover:underline dark:text-gray-400"
              >
                Comparer
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}