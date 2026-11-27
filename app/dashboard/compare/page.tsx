// app/dashboard/compare/page.tsx

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GitHubClient } from '@/lib/github/client'
import { aggregateProfile } from '@/lib/github/aggregator'
import { calculateScore } from '@/lib/score/calculate'
import { getCache, cacheKeys } from '@/lib/cache/redis'
import { validateUsername } from '@/lib/validation/username'
import { config } from '@/lib/config'
import { ComparisonRadarWrapper } from '@/components/Dashboard/ComparisonRadarWrapper'
import { Card, CardContent } from '@/components/ui/Card'
import { FadeIn } from '@/components/ui/FadeIn'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

async function fetchProfileData(username: string) {
  const validation = validateUsername(username)
  if (!validation.ok) return null

  const cache = getCache()
  const cacheKey = cacheKeys.profile(validation.value, false)

  return cache.getOrSet(cacheKey, config.github.cacheTtlSeconds, async () => {
    const client = new GitHubClient()
    const profile = await aggregateProfile(client, validation.value, {
      includePrivate: false,
    })
    return { profile, score: calculateScore(profile) }
  })
}

export default function ComparePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CompareSkeleton />}>
      <CompareContent searchParams={searchParams} />
    </Suspense>
  )
}

async function CompareContent({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { a, b } = await searchParams

  if (!a || !b) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent>
            <EmptyState
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="9" r="3" />
                  <circle cx="15" cy="15" r="3" />
                </svg>
              }
              title="Comparer deux profils"
              description="Ajoute ?a=username1&b=username2 à l'URL, ou clique sur « Comparer » depuis tes profils sauvegardés."
              action={<ButtonLink href="/dashboard/saved">Voir mes profils sauvegardés</ButtonLink>}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const [dataA, dataB] = await Promise.all([
    fetchProfileData(a),
    fetchProfileData(b),
  ])

  if (!dataA || !dataB) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-red-600">
          Un des profils est invalide ou introuvable.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight">
          @{dataA.profile.user.login} vs @{dataB.profile.user.login}
        </h1>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                @{dataA.profile.user.login}
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums">
                {dataA.score.total}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card>
            <CardContent className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                @{dataB.profile.user.login}
              </p>
              <p className="mt-2 text-4xl font-bold tabular-nums">
                {dataB.score.total}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardContent>
            <ComparisonRadarWrapper
              scores={[
                { label: dataA.profile.user.login, score: dataA.score },
                { label: dataB.profile.user.login, score: dataB.score },
              ]}
            />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}

function CompareSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-80" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
      <Card><CardContent><Skeleton className="h-80 w-full" /></CardContent></Card>
    </div>
  )
}