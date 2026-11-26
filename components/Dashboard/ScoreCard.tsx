// components/Dashboard/ScoreCard.tsx

import type { ScoreResult } from '@/lib/score/types'

interface ScoreCardProps {
  score: ScoreResult
}

const CRITERION_LABELS: Record<string, string> = {
  communityImpact: 'Impact communautaire',
  recentActivity: 'Activité récente',
  repoQuality: 'Qualité des repos',
  languageDiversity: 'Diversité technique',
  profileCompleteness: 'Complétude du profil',
}

function scoreColor(total: number): string {
  if (total >= 80) return 'text-green-600 dark:text-green-400'
  if (total >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

/**
 * Carte du score avec breakdown transparent.
 * L'utilisateur voit POURQUOI il a ce score (pas une boîte noire).
 */
export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">Score de profil</h2>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-5xl font-bold ${scoreColor(score.total)}`}>
          {score.total}
        </span>
        <span className="text-gray-500">/ 100</span>
      </div>

      <ul className="mt-6 space-y-3">
        {score.breakdown.map((item) => (
          <li key={item.criterionId}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {CRITERION_LABELS[item.criterionId] ?? item.criterionId}
              </span>
              <span className="font-medium">
                {Math.round(item.rawScore)} / 100
                <span className="ml-2 text-xs text-gray-400">
                  (poids {Math.round(item.weight * 100)}%)
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${item.rawScore}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}