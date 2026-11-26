// app/u/[username]/page.tsx

import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/Dashboard/ProfileHeader'
import { ScoreCard } from '@/components/Dashboard/ScoreCard'
import { LanguagePie } from '@/components/Dashboard/LanguagePie'
import { ActivityHeatmap } from '@/components/Dashboard/ActivityHeatmap'
import { TopRepos } from '@/components/Dashboard/TopRepos'
import { GitHubClient } from '@/lib/github/client'
import { aggregateProfile } from '@/lib/github/aggregator'
import { calculateScore } from '@/lib/score/calculate'
import { getCache, cacheKeys } from '@/lib/cache/redis'
import { validateUsername } from '@/lib/validation/username'
import { GitHubNotFoundError } from '@/lib/errors'
import { config } from '@/lib/config'
import { DashboardView } from '@/components/Dashboard/DashboardView'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton'

// export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ username: string }>
}


/**
 * Dashboard public d'un profil GitHub.
 * Server Component : fetch direct via lib/ (pas de round-trip HTTP interne).
 */
export default async function ProfilePage({ params }: PageProps) {
    const { username } = await params
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
                const client = new GitHubClient() // fallback GITHUB_TOKEN serveur
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isAuthenticated = Boolean(user)

    return (
        <main className="mx-auto max-w-6xl space-y-6 p-6">
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardView profile={profile} score={score} isAuthenticated={isAuthenticated} />
            </Suspense>
            <ProfileHeader user={profile.user} includesPrivate={profile.includesPrivate} />

            <div className="grid gap-6 lg:grid-cols-2">
                <ScoreCard score={score} />
                <LanguagePie languages={profile.languages} />
            </div>

            <ActivityHeatmap events={profile.events} />
            <TopRepos repos={profile.repos} />
        </main>
    )
}