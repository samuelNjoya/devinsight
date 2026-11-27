// components/landing/Preview.tsx

import { FadeIn } from '@/components/ui/FadeIn'
import { Card } from '@/components/ui/Card'

/**
 * Aperçu visuel statique du dashboard (pas de fetch).
 * Montre le produit sans dépendre de GitHub.
 */
export function Preview() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Un dashboard qui parle
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-500 dark:text-zinc-400">
              Toutes les métriques qui comptent, présentées avec clarté.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="mt-16 overflow-hidden p-0">
            {/* Fake header de dashboard */}
            <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-800">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-2 h-3 w-48 rounded bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
              <div className="hidden gap-2 sm:flex">
                <div className="h-8 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-8 w-24 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>

            {/* Fake grid */}
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              {/* Score */}
              <div className="rounded-xl border border-zinc-100 p-6 text-center dark:border-zinc-800">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600">
                  <span className="text-3xl font-bold text-white">87</span>
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Score global
                </p>
              </div>
              {/* Pie */}
              <div className="rounded-xl border border-zinc-100 p-6 dark:border-zinc-800">
                <div className="flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-8 border-blue-500 border-t-violet-500 border-r-pink-500 border-b-emerald-500" />
                </div>
                <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Langages
                </p>
              </div>
            </div>

            {/* Fake heatmap */}
            <div className="border-t border-zinc-100 p-6 dark:border-zinc-800">
              <div className="grid grid-cols-26 gap-1">
                {Array.from({ length: 52 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 rounded-sm ${
                      i % 5 === 0
                        ? 'bg-green-600'
                        : i % 3 === 0
                          ? 'bg-green-400'
                          : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  )
}