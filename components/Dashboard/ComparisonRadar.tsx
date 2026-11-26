// components/Dashboard/ComparisonRadar.tsx

'use client'

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { ScoreResult } from '@/lib/score/types'

interface ComparisonRadarProps {
  scores: { label: string; score: ScoreResult }[]
}

const CRITERION_SHORT: Record<string, string> = {
  communityImpact: 'Impact',
  recentActivity: 'Activité',
  repoQuality: 'Qualité',
  languageDiversity: 'Diversité',
  profileCompleteness: 'Profil',
}

/**
 * Radar chart comparant 2 profils sur les 5 critères.
 * Recharts utilise des APIs navigateur → Client Component obligatoire [citation:11].
 */
export function ComparisonRadar({ scores }: ComparisonRadarProps) {
  // Transforme les breakdown en format Recharts : [{ criterion, A, B }]
  const data = scores[0]?.score.breakdown.map((item, idx) => {
    const row: Record<string, string | number> = {
      criterion: CRITERION_SHORT[item.criterionId] ?? item.criterionId,
    }
    scores.forEach((s) => {
      row[s.label] = Math.round(s.score.breakdown[idx]?.rawScore ?? 0)
    })
    return row
  }) ?? []

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="criterion" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          {scores.map((s, idx) => (
            <Radar
              key={s.label}
              name={s.label}
              dataKey={s.label}
              stroke={idx === 0 ? '#3b82f6' : '#ef4444'}
              fill={idx === 0 ? '#3b82f6' : '#ef4444'}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}