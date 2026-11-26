// components/SaveProfileButton.tsx

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProfileData } from '@/lib/github/types'
import type { ScoreResult } from '@/lib/score/types'

interface SaveProfileButtonProps {
    profile: ProfileData
    score: ScoreResult
    isAuthenticated: boolean
}

export function SaveProfileButton({ profile, score, isAuthenticated }: SaveProfileButtonProps) {
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSave() {
        if (!isAuthenticated) {
            window.location.href = '/login'
            return
        }

        setSaving(true)
        setError(null)

        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setError('Session expirée. Reconnecte-toi.')
            setSaving(false)
            return
        }
        const { error: dbError } = await supabase.from('saved_profiles').insert({
            user_id: user.id,  // ← AJOUT CRITIQUE
            github_username: profile.user.login,
            score: score.total,
            snapshot: { profile, score },
        })

        if (dbError) {
            setError(dbError.message)
        } else {
            setSaved(true)
        }
        setSaving(false)
    }

    if (saved) {
        return (
            <span className="text-sm text-green-600 dark:text-green-400">
                Profil sauvegardé
            </span>
        )
    }

    return (
        <div>
            <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
                {saving ? 'Sauvegarde...' : 'Sauvegarder ce profil'}
            </button>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    )
}