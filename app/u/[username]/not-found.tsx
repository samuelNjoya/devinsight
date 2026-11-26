// app/u/[username]/not-found.tsx

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">Profil introuvable</h1>
      <p className="text-gray-500">
        Cet utilisateur GitHub n&apos;existe pas ou n&apos;est pas accessible.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}