// components/Dashboard/LanguagePie.tsx

'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface LanguagePieProps {
  languages: Readonly<Record<string, number>>
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

/**
 * Pie chart de répartition des langages.
 * Client Component car Recharts manipule le DOM.
 */
export function LanguagePie({ languages }: LanguagePieProps) {
  const data = Object.entries(languages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Langages</h2>
        <p className="mt-4 text-sm text-gray-500">Aucun langage détecté.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">Langages</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => entry.name}
            >
              {data.map((_, index) => (
                // <Cell key={index} fill={COLORS[index % COLORS.length]} />
                <Cell key={index} fill={COLORS[index % COLORS.length] ?? '#3b82f6'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}