// components/Dashboard/ActivityHeatmap.tsx

import type { GitHubEventSummary } from '@/lib/github/types'

interface ActivityHeatmapProps {
  events: readonly GitHubEventSummary[]
}

const DAYS = 7
const WEEKS = 52
const CELL_SIZE = 12
const CELL_GAP = 3

/**
 * Calcule le nombre d'events par jour sur les 12 derniers mois.
 * Retourne une map "YYYY-MM-DD" → count.
 */
function groupEventsByDay(events: readonly GitHubEventSummary[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const event of events) {
    const day = event.createdAt.slice(0, 10) // "YYYY-MM-DD"
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return map
}

/**
 * Génère la grille de dates : 52 semaines × 7 jours, en partant d'il y a 1 an.
 */
function buildDateGrid(): string[][] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - WEEKS * 7)

  // Aligner sur le lundi
  const dayOfWeek = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - dayOfWeek)

  const grid: string[][] = []
  const cursor = new Date(start)

  for (let week = 0; week < WEEKS; week++) {
    const column: string[] = []
    for (let day = 0; day < DAYS; day++) {
      column.push(cursor.toISOString().slice(0, 10))
      cursor.setDate(cursor.getDate() + 1)
    }
    grid.push(column)
  }
  return grid
}

function intensityClass(count: number): string {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-800'
  if (count <= 2) return 'bg-green-200 dark:bg-green-900'
  if (count <= 5) return 'bg-green-400 dark:bg-green-700'
  if (count <= 10) return 'bg-green-600 dark:bg-green-500'
  return 'bg-green-800 dark:bg-green-300'
}

/**
 * Heatmap d'activité sur 12 mois.
 * Basée sur les events publics GitHub (limités à ~300 par l'API).
 * Composant serveur : aucun JS envoyé au client.
 */
export function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const counts = groupEventsByDay(events)
  const grid = buildDateGrid()

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">Activité (12 derniers mois)</h2>
      <p className="mt-1 text-xs text-gray-500">
        Basée sur les events publics — peut être incomplète
      </p>

      <div className="mt-4 overflow-x-auto">
        <div
          className="inline-grid"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${DAYS}, ${CELL_SIZE}px)`,
            gap: CELL_GAP,
          }}
        >
          {Array.from({ length: WEEKS }).map((_, weekIdx) =>
            grid[weekIdx]?.map((date, dayIdx) => {
              const count = counts.get(date) ?? 0
              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`rounded-sm ${intensityClass(count)}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  title={`${date} : ${count} event(s)`}
                />
              )
            })
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
          <div className="h-3 w-3 rounded-sm bg-green-800 dark:bg-green-300" />
        </div>
        <span>Plus</span>
      </div>
    </section>
  )
}