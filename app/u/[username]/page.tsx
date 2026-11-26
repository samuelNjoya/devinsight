// app/u/[username]/page.tsx

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { DashboardView } from '@/components/Dashboard/DashboardView'
import { GitHubClient } from '@/lib/github/client'
import { aggregateProfile } from '@/lib/github/aggregator'
import { calculateScore } from '@/lib/score/calculate'
import { getCache, cacheKeys } from '@/lib/cache/redis'
import { validateUsername } from '@/lib/validation/username'
import { GitHubNotFoundError } from '@/lib/errors'
import { config } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ username: string }>
}

/**
 * Shell statique + contenu dynamique streamé.
 * params est passé en promesse au composant enfant,
 * qui l'attend DANS le <Suspense>.
 */
export default function ProfilePage({ params }: PageProps) {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <ProfileContent params={params} />
      </Suspense>
    </main>
  )
}

async function ProfileContent({ params }: PageProps) {
  const { username } = await params  // ← attendu DANS le Suspense
  const validation = validateUsername(username)

  if (!validation.ok) {
    notFound()
  }

  const cache = getCache()
  const cacheKey = cacheKeys.profile(validation.value, false)

  let result
  try {
    result = await cache.getOrSet(
      cacheKey,
      config.github.cacheTtlSeconds,
      async () => {
        const client = new GitHubClient()
        const profile = await aggregateProfile(client, validation.value, {
          includePrivate: false,
        })
        const score = calculateScore(profile)
        return { profile, score }
      }
    )
  } catch (error) {
    if (error instanceof GitHubNotFoundError) {
      notFound()
    }
    throw error
  }

  const { profile, score } = result

  // Session lue ici aussi (dans le Suspense)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = Boolean(user)

  return (
    <DashboardView
      profile={profile}
      score={score}
      isAuthenticated={isAuthenticated}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}