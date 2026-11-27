// app/dashboard/saved/page.tsx

import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { FadeIn } from '@/components/ui/FadeIn'

interface SavedProfile {
  id: string
  github_username: string
  score: number
  created_at: string
}

export default function SavedProfilesPage() {
  return (
    <Suspense fallback={<SavedSkeleton />}>
      <SavedProfilesContent />
    </Suspense>
  )
}

async function SavedProfilesContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profiles, error } = await supabase
    .from('saved_profiles')
    .select('id, github_username, score, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-red-600">Erreur : {error.message}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mes profils sauvegardés
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {profiles?.length ?? 0} profil{(profiles?.length ?? 0) > 1 ? 's' : ''} sauvegardé{(profiles?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      </FadeIn>

      {!profiles || profiles.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              }
              title="Aucun profil sauvegardé"
              description="Analyse un profil et clique sur « Sauvegarder » pour le retrouver ici."
              action={<ButtonLink href="/">Analyser un profil</ButtonLink>}
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {profiles.map((p: SavedProfile, i) => (
            <FadeIn key={p.id} delay={Math.min(i * 0.05, 0.3)}>
              <li>
                <Card interactive>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/u/${p.github_username}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        @{p.github_username}
                      </Link>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Badge
                          variant={
                            p.score >= 80 ? 'success' : p.score >= 50 ? 'warning' : 'danger'
                          }
                        >
                          Score {p.score}
                        </Badge>
                        <span>·</span>
                        <time dateTime={p.created_at}>
                          {new Date(p.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                    <ButtonLink
                      href={`/dashboard/compare?a=${p.github_username}`}
                      variant="secondary"
                      size="sm"
                    >
                      Comparer
                    </ButtonLink>
                  </CardContent>
                </Card>
              </li>
            </FadeIn>
          ))}
        </ul>
      )}
    </div>
  )
}

function SavedSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-64" />
      <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
      <Card><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
    </div>
  )
}