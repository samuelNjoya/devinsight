// components/Dashboard/ProfileHeader.tsx

import Image from 'next/image'
import type { GitHubUserSummary } from '@/lib/github/types'

interface ProfileHeaderProps {
  user: GitHubUserSummary
  includesPrivate: boolean
}

/**
 * En-tête du dashboard : avatar, nom, bio, stats de base.
 * Composant serveur (pas de 'use client') → zéro JS envoyé au client.
 */
export function ProfileHeader({ user, includesPrivate }: ProfileHeaderProps) {
  return (
    <header className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
      <Image
        src={user.avatarUrl}
        alt={`Avatar de ${user.login}`}
        width={96}
        height={96}
        className="rounded-full"
        priority
      />

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{user.name ?? user.login}</h1>
          <a
            href={user.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            @{user.login}
          </a>
          {includesPrivate && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              Inclut dépôts privés
            </span>
          )}
        </div>

        {user.bio && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{user.bio}</p>
        )}

        <dl className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-gray-500">Repos</dt>
            <dd className="font-semibold">{user.publicRepos}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Followers</dt>
            <dd className="font-semibold">{user.followers}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Following</dt>
            <dd className="font-semibold">{user.following}</dd>
          </div>
        </dl>
      </div>
    </header>
  )
}