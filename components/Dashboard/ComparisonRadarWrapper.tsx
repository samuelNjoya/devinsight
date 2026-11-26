// components/Dashboard/ComparisonRadarWrapper.tsx

'use client'

import dynamic from 'next/dynamic'
import type { ScoreResult } from '@/lib/score/types'

const ComparisonRadar = dynamic(
  () =>
    import('./ComparisonRadar').then((m) => m.ComparisonRadar),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
    ),
  }
)

interface ComparisonRadarWrapperProps {
  scores: { label: string; score: ScoreResult }[]
}

export function ComparisonRadarWrapper({ scores }: ComparisonRadarWrapperProps) {
  return <ComparisonRadar scores={scores} />
}