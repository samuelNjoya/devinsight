// components/Dashboard/ActivityHeatmap.tsx

import { Card, CardContent } from '@/components/ui/Card'
import type { ContributionCalendar, GitHubEventSummary } from '@/lib/github/types'

interface ActivityHeatmapProps {
  // events: readonly GitHubEventSummary[]
  contributions: ContributionCalendar
}

const DAYS = 7
const WEEKS = 52
const CELL = 12
const GAP = 3

// function groupEventsByDay(events: readonly GitHubEventSummary[]): Map<string, number> {
//   const map = new Map<string, number>()
//   for (const event of events) {
//     const day = event.createdAt.slice(0, 10)
//     map.set(day, (map.get(day) ?? 0) + 1)
//   }
//   return map
// }

function groupContributionsByDay(
  contributions: ContributionCalendar
): Map<string, number> {
  const map = new Map<string, number>()
  for (const day of contributions.days) {
    map.set(day.date, day.count)
  }
  return map
}


function buildDateGrid(): string[][] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(today.getDate() - WEEKS * 7)
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
  if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800'
  if (count <= 2) return 'bg-green-200 dark:bg-green-900'
  if (count <= 5) return 'bg-green-400 dark:bg-green-700'
  if (count <= 10) return 'bg-green-600 dark:bg-green-500'
  return 'bg-green-800 dark:bg-green-300'
}

const DAY_LABELS = ['Lun', '', 'Mer', '', 'Ven', '', 'Dim'] as const

export function ActivityHeatmap({ contributions }: ActivityHeatmapProps) {
  // const counts = groupEventsByDay(events)
   const counts = groupContributionsByDay(contributions)
  const grid = buildDateGrid()

  return (
    <Card>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold tracking-tight">
            Activité (12 derniers mois)
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {/* {events.length} events */}
             {contributions.totalContributions} contributions
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Commits, PRs et issues — inclut les contributions privées si activées sur GitHub
        </p>

        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {/* Labels de jours */}
            <div
              className="grid shrink-0 text-[10px] text-zinc-400"
              style={{
                gridTemplateRows: `repeat(${DAYS}, ${CELL}px)`,
                gap: GAP,
              }}
              aria-hidden
            >
              {DAY_LABELS.map((label, i) => (
                <span key={i} className="flex items-center">
                  {label}
                </span>
              ))}
            </div>

            {/* Grille */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${WEEKS}, ${CELL}px)`,
                gridTemplateRows: `repeat(${DAYS}, ${CELL}px)`,
                gap: GAP,
              }}
            >
              {Array.from({ length: WEEKS }).map((_, weekIdx) =>
                grid[weekIdx]?.map((date, dayIdx) => {
                  const count = counts.get(date) ?? 0
                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`rounded-sm transition-transform hover:scale-125 ${intensityClass(count)}`}
                      style={{ width: CELL, height: CELL }}
                      title={`${date} : ${count} event${count > 1 ? 's' : ''}`}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Moins</span>
          <div className="flex gap-1" aria-hidden>
            <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
            <div className="h-3 w-3 rounded-sm bg-green-800 dark:bg-green-300" />
          </div>
          <span>Plus</span>
        </div>
      </CardContent>
    </Card>
  )
}