// components/Dashboard/DashboardView.tsx

'use client'

import { useRef } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ScoreCard } from './ScoreCard'
import { LanguagePie } from './LanguagePie'
import { ActivityHeatmap } from './ActivityHeatmap'
import { TopRepos } from './TopRepos'
import { ExportButton } from './ExportButton'
import type { ProfileData } from '@/lib/github/types'
import type { ScoreResult } from '@/lib/score/types'
import { SaveProfileButton } from '../SaveProfileButton'

interface DashboardViewProps {
    profile: ProfileData
    score: ScoreResult
     isAuthenticated: boolean
}

/**
 * Wrapper Client Component : permet de passer une ref au bouton d'export.
 * Les composants enfants (ProfileHeader, etc.) restent des Server Components
 * et n'envoient pas de JS au client.
 */
export function DashboardView({ profile, score, isAuthenticated }: DashboardViewProps) {
    const dashboardRef = useRef<HTMLDivElement>(null)

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <SaveProfileButton
                    profile={profile}
                    score={score}
                    isAuthenticated={isAuthenticated} // à passer en prop depuis le parent
                />
                <ExportButton targetRef={dashboardRef} fileName={`devinsight-${profile.user.login}`} />
            </div>

            <div ref={dashboardRef} className="space-y-6">
                <ProfileHeader user={profile.user} includesPrivate={profile.includesPrivate} />
                <div className="grid gap-6 lg:grid-cols-2">
                    <ScoreCard score={score} />
                    <LanguagePie languages={profile.languages} />
                </div>
                <ActivityHeatmap events={profile.events} />
                <TopRepos repos={profile.repos} />
            </div>
        </div>
    )
}