// components/Dashboard/ProfileHeader.tsx

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { GitHubUserSummary } from '@/lib/github/types'

interface ProfileHeaderProps {
  user: GitHubUserSummary
  includesPrivate: boolean
}

export function ProfileHeader({ user, includesPrivate }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Image
          src={user.avatarUrl}
          alt={`Avatar de ${user.login}`}
          width={96}
          height={96}
          className="rounded-full ring-4 ring-zinc-100 dark:ring-zinc-800"
          priority
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {user.name ?? user.login}
            </h1>
            <a
              href={user.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              @{user.login}
            </a>
            {includesPrivate && (
              <Badge variant="private">Inclut dépôts privés</Badge>
            )}
          </div>

          {user.bio && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {user.bio}
            </p>
          )}

          <dl className="mt-4 flex flex-wrap gap-6 text-sm">
            <Stat label="Repos" value={user.publicRepos} />
            <Stat label="Followers" value={user.followers} />
            <Stat label="Following" value={user.following} />
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}