// components/Dashboard/ScoreCard.tsx

'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tooltip } from '@/components/ui/Tooltip'
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

const CRITERION_HINTS: Record<string, string> = {
  communityImpact: 'Basé sur le total de stars de tes repos (log scale)',
  recentActivity: 'Nombre d\'events GitHub sur les 90 derniers jours',
  repoQuality: 'Repos avec description + README + license + topics',
  languageDiversity: 'Nombre de langages distincts utilisés',
  profileCompleteness: 'Bio, site web et nom affiché complétés',
}

function scoreColor(total: number): string {
  if (total >= 80) return 'text-green-600 dark:text-green-400'
  if (total >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreGradient(total: number): string {
  if (total >= 80) return 'from-green-500 to-emerald-500'
  if (total >= 50) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Score de profil</h2>
        </div>

        <ScoreCircle total={score.total} />

        <ul className="space-y-3">
          {score.breakdown.map((item) => (
            <li key={item.criterionId}>
              <div className="flex items-center justify-between text-sm">
                <Tooltip content={CRITERION_HINTS[item.criterionId] ?? ''}>
                  <span className="cursor-help text-zinc-600 underline-offset-2 decoration-dotted hover:underline dark:text-zinc-400">
                    {CRITERION_LABELS[item.criterionId] ?? item.criterionId}
                  </span>
                </Tooltip>
                <span className="font-medium tabular-nums">
                  {Math.round(item.rawScore)} / 100
                  <span className="ml-2 text-xs text-zinc-400">
                    ({Math.round(item.weight * 100)}%)
                  </span>
                </span>
              </div>
              <ProgressBar value={item.rawScore} className="mt-1.5" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ScoreCircle({ total }: { total: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v))

  useEffect(() => {
    const controls = animate(motionValue, total, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [total, motionValue])

  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayValue / 100) * circumference

  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        aria-hidden
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col items-center">
        <motion.span
          className={`text-4xl font-bold tabular-nums ${scoreColor(total)}`}
          aria-live="polite"
        >
          {rounded.get()}
        </motion.span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">/ 100</span>
      </div>
    </div>
  )
}