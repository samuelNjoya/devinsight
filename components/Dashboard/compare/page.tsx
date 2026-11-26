// app/dashboard/compare/page.tsx

import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { GitHubClient } from '@/lib/github/client'
import { aggregateProfile } from '@/lib/github/aggregator'
import { calculateScore } from '@/lib/score/calculate'
import { getCache, cacheKeys } from '@/lib/cache/redis'
import { validateUsername } from '@/lib/validation/username'
import { config } from '@/lib/config'

// Import dynamique avec ssr: false — Recharts a besoin du DOM [citation:7][citation:11]
const ComparisonRadar = dynamic(
  () => import('@/components/Dashboard/ComparisonRadar').then((m) => m.ComparisonRadar),
  { ssr: false, loading: () => <p className="h-80 animate-pulse rounded-xl bg-gray-100" /> }
)

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
    const profile = await aggregateProfile(client, validation.value, { includePrivate: false })
    return { profile, score: calculateScore(profile) }
  })
}

export default async function ComparePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { a, b } = await searchParams
  if (!a || !b) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Comparer deux profils</h1>
        <p className="mt-4 text-gray-500">
          Ajoute <code>?a=username1&amp;b=username2</code> à l&apos;URL.
        </p>
      </main>
    )
  }

  const [dataA, dataB] = await Promise.all([fetchProfileData(a), fetchProfileData(b)])

  if (!dataA || !dataB) {
    return <p className="p-6 text-red-600">Un des profils est invalide ou introuvable.</p>
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">
        @{dataA.profile.user.login} vs @{dataB.profile.user.login}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4 text-center">
          <p className="text-sm text-gray-500">@{dataA.profile.user.login}</p>
          <p className="text-3xl font-bold">{dataA.score.total}</p>
        </div>
        <div className="rounded-xl border p-4 text-center">
          <p className="text-sm text-gray-500">@{dataB.profile.user.login}</p>
          <p className="text-3xl font-bold">{dataB.score.total}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 dark:bg-gray-900">
        <ComparisonRadar
          scores={[
            { label: dataA.profile.user.login, score: dataA.score },
            { label: dataB.profile.user.login, score: dataB.score },
          ]}
        />
      </div>
    </main>
  )
}