// components/Dashboard/LanguagePie.tsx

'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'

interface LanguagePieProps {
  languages: Readonly<Record<string, number>>
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
  '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ef4444',
] as const

export function LanguagePie({ languages }: LanguagePieProps) {
  const data = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <h2 className="text-base font-semibold tracking-tight">Langages</h2>
          <p className="mt-4 text-sm text-zinc-500">Aucun langage détecté.</p>
        </CardContent>
      </Card>
    )
  }

  const top = data[0]!

  return (
    <Card>
      <CardContent>
        <h2 className="text-base font-semibold tracking-tight">Langages</h2>

        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length] ?? '#3b82f6'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Top</span>
              <span className="text-sm font-semibold">{top.name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {Math.round((top.value / total) * 100)}%
              </span>
            </div>
          </div>

          <ul className="flex-1 space-y-2 text-sm">
            {data.slice(0, 5).map((entry, index) => (
              <li key={entry.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  aria-hidden
                />
                <span className="flex-1 truncate text-zinc-600 dark:text-zinc-400">
                  {entry.name}
                </span>
                <span className="tabular-nums text-zinc-500">
                  {Math.round((entry.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}