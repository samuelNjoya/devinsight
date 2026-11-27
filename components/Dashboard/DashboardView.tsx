// components/Dashboard/DashboardView.tsx

'use client'

import { useRef } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ScoreCard } from './ScoreCard'
import { LanguagePie } from './LanguagePie'
import { ActivityHeatmap } from './ActivityHeatmap'
import { TopRepos } from './TopRepos'
import { ExportButton } from './ExportButton'
import { SaveProfileButton } from '@/components/SaveProfileButton'
import { FadeIn } from '@/components/ui/FadeIn'
import type { ProfileData } from '@/lib/github/types'
import type { ScoreResult } from '@/lib/score/types'

interface DashboardViewProps {
  profile: ProfileData
  score: ScoreResult
  isAuthenticated: boolean
}

export function DashboardView({ profile, score, isAuthenticated }: DashboardViewProps) {
  const dashboardRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SaveProfileButton
          profile={profile}
          score={score}
          isAuthenticated={isAuthenticated}
        />
        <ExportButton
          targetRef={dashboardRef}
          fileName={`devinsight-${profile.user.login}`}
        />
      </div>

      <div ref={dashboardRef} className="space-y-6">
        <FadeIn>
          <ProfileHeader
            user={profile.user}
            includesPrivate={profile.includesPrivate}
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreCard score={score} />
            <LanguagePie languages={profile.languages} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <ActivityHeatmap events={profile.events} />
        </FadeIn>

        <FadeIn delay={0.3}>
          <TopRepos repos={profile.repos} />
        </FadeIn>
      </div>
    </div>
  )
}