// components/Dashboard/TopRepos.tsx

import type { GitHubRepoSummary } from '@/lib/github/types'

interface TopReposProps {
  repos: readonly GitHubRepoSummary[]
}

/**
 * Top 3 repos par nombre de stars.
 * Composant serveur : pas de JS client.
 */
export function TopRepos({ repos }: TopReposProps) {
  const top = [...repos]
    .filter((repo) => !repo.isPrivate) // On n'affiche que les repos publics
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 3)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">Top 3 repos</h2>

      {top.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Aucun repo public.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {top.map((repo) => (
            <li
              key={repo.name}
              className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {repo.name}
              </a>
              {repo.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {repo.description}
                </p>
              )}
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                {repo.language && <span>{repo.language}</span>}
                <span>★ {repo.stars}</span>
                <span>⑂ {repo.forks}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}