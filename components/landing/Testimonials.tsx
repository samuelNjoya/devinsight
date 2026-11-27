// components/landing/Testimonials.tsx

import { FadeIn } from '@/components/ui/FadeIn'
import { Card } from '@/components/ui/Card'

const TESTIMONIALS = [
  {
    quote:
      "DevInsight m'a aidé à comprendre pourquoi mon profil ne décollait pas. Le score détaillé est super clair.",
    author: 'Marie D.',
    role: 'Frontend Developer',
    initials: 'MD',
    color: 'from-pink-500 to-rose-500',
  },
  {
    quote:
      "J'ai enfin un outil pour comparer mon profil à celui de mes collègues sans me perdre dans les stats GitHub.",
    author: 'Thomas L.',
    role: 'Full Stack Engineer',
    initials: 'TL',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    quote:
      "L'export PNG est génial pour mon portfolio. J'ai partagé mon score sur LinkedIn et j'ai eu 3 entretiens.",
    author: 'Sarah K.',
    role: 'DevOps Engineer',
    initials: 'SK',
    color: 'from-violet-500 to-purple-500',
  },
] as const

export function Testimonials() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50 px-4 py-24 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ils ont testé DevInsight
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-500 dark:text-zinc-400">
              Des développeurs de tous horizons utilisent DevInsight pour
              améliorer leur profil.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.author} delay={i * 0.1}>
              <Card className="flex h-full flex-col p-6">
                <svg
                  className="h-8 w-8 text-zinc-300 dark:text-zinc-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M9.5 6.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c.5 0 1-.1 1.5-.3-.5 1.5-1.5 2.8-3 3.5l.5 1c3-1 5-3.5 5-7 0-3-2-6.2-4-6.2zm10 0c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c.5 0 1-.1 1.5-.3-.5 1.5-1.5 2.8-3 3.5l.5 1c3-1 5-3.5 5-7 0-3-2-6.2-4-6.2z" />
                </svg>
                <p className="mt-4 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {t.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-semibold text-white`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.author}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}