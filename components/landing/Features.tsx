// components/landing/Features.tsx

import { FadeIn } from '@/components/ui/FadeIn'
import { Card } from '@/components/ui/Card'

const FEATURES = [
  {
    title: 'Score de 0 à 100',
    description:
      'Un score transparent basé sur 5 critères : impact, activité, qualité, diversité, complétude.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Langages & activité',
    description:
      'Visualise la répartition de tes langages et ton activité sur 12 mois avec des graphiques interactifs.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-4 4 4 4-8" />
      </svg>
    ),
    color: 'from-violet-500 to-violet-600',
  },
  {
    title: 'Comparaison',
    description:
      'Compare deux profils côte à côte avec un radar chart et découvre qui excelle sur chaque critère.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="9" r="3" />
        <circle cx="15" cy="15" r="3" />
        <path d="M9 12v3M15 9V6" />
      </svg>
    ),
    color: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Export PNG',
    description:
      'Télécharge ton dashboard en haute résolution pour le partager sur LinkedIn ou ton portfolio.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5M12 15V3" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
  },
] as const

export function Features() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50 px-4 py-24 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce dont tu as besoin
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-500 dark:text-zinc-400">
              Des insights actionnables sur ton profil GitHub, présentés de manière
              claire et visuelle.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <Card className="h-full p-6">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white shadow-sm`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {feature.description}
                </p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}