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

// ⚠️ SUPPRIMÉ : le dynamic import avec ssr: false (interdit en Server Component)

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

async function fetchProfileData(username: string) {
  const validation = validateUsername(username)
  if (!validation.ok) return null

  const cache = getCache()
  const cacheKey = cacheKeys.profile(validation.value, false)

  // return cache.getOrSet(cacheKey, config.github.cacheTtlSeconds, async () => {
  //   const client = new GitHubClient()
  //   const profile = await aggregateProfile(client, validation.value, {
  //     includePrivate: false,
  //   })
  //   return { profile, score: calculateScore(profile) }
  // })

  return cache.getOrSet(cacheKey, config.github.cacheTtlSeconds, async () => {
    const client = new GitHubClient()
    const profile = await aggregateProfile(client, validation.value, {
      includePrivate: false,
    })
    // Horloge fixe = déterministe pour le prerender
   // const score = calculateScore(profile, () => 0)
    //return { profile, score }
     return { profile, score: calculateScore(profile) }
  })
}

export default function ComparePage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Suspense fallback={<CompareSkeleton />}>
        <CompareContent searchParams={searchParams} />
      </Suspense>
    </main>
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
      <div>
        <h1 className="text-2xl font-bold">Comparer deux profils</h1>
        <p className="mt-4 text-gray-500">
          Ajoute <code>?a=username1&amp;b=username2</code> à l&apos;URL.
        </p>
      </div>
    )
  }

  const [dataA, dataB] = await Promise.all([
    fetchProfileData(a),
    fetchProfileData(b),
  ])

  if (!dataA || !dataB) {
    return <p className="text-red-600">Un des profils est invalide ou introuvable.</p>
  }

  return (
    <>
      <h1 className="text-2xl font-bold">
        @{dataA.profile.user.login} vs @{dataB.profile.user.login}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">@{dataA.profile.user.login}</p>
          <p className="text-3xl font-bold">{dataA.score.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500">@{dataB.profile.user.login}</p>
          <p className="text-3xl font-bold">{dataB.score.total}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <ComparisonRadarWrapper
          scores={[
            { label: dataA.profile.user.login, score: dataA.score },
            { label: dataB.profile.user.login, score: dataB.score },
          ]}
        />
      </div>
    </>
  )
}

function CompareSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-80 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}