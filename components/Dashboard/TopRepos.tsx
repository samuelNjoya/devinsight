// components/Dashboard/TopRepos.tsx

import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { GitHubRepoSummary } from '@/lib/github/types'

interface TopReposProps {
  repos: readonly GitHubRepoSummary[]
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
} as const

export function TopRepos({ repos }: TopReposProps) {
  const top = [...repos]
    .filter((repo) => !repo.isPrivate)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 3)

  return (
    <Card>
      <CardContent>
        <h2 className="text-base font-semibold tracking-tight">Top 3 repos</h2>

        {top.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Aucun repo public.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {top.map((repo) => (
              <li key={repo.name}>
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full rounded-lg border border-zinc-200 p-4 transition-all hover:border-blue-500 hover:shadow-md dark:border-zinc-800 dark:hover:border-blue-500"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                      {repo.name}
                    </h3>
                    {repo.isPrivate && <Badge variant="private">Privé</Badge>}
                  </div>

                  {repo.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {repo.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              LANGUAGE_COLORS[repo.language] ?? '#8b8b8b',
                          }}
                          aria-hidden
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <StarIcon />
                      {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <ForkIcon />
                      {repo.forks}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ForkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6 8v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8M12 14v2" />
    </svg>
  )
}