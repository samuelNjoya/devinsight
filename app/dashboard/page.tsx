// app/dashboard/page.tsx

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'

/**
 * Dashboard de l'utilisateur connecté.
 * Protégé par le middleware (redirige vers /login si non connecté).
 */
export default async function DashboardPage() {
  await connection() // force le rendu dynamique, autorise Date.now()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const githubUsername = user.user_metadata?.user_name as string | undefined
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {githubUsername ?? 'dev'}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={githubUsername ? `/u/${githubUsername}` : '/login'}
          className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-500 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="font-semibold">Analyser mon profil</h2>
          <p className="mt-1 text-sm text-gray-500">
            Voir mon score et mes statistiques GitHub
          </p>
        </Link>

        <Link
          href="/dashboard/saved"
          className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-500 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="font-semibold">Mes profils sauvegardés</h2>
          <p className="mt-1 text-sm text-gray-500">
            Retrouver les profils analysés précédemment
          </p>
        </Link>
      </div>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  )
}