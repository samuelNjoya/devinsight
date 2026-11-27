// app/dashboard/page.tsx

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { FadeIn } from '@/components/ui/FadeIn'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const githubUsername = user.user_metadata?.user_name as string | undefined
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <Card>
          <CardContent className="flex items-center gap-4">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={64}
                height={64}
                className="rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Bonjour, {githubUsername ?? 'dev'}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn delay={0.1}>
          <Link href={githubUsername ? `/u/${githubUsername}` : '/login'}>
            <Card interactive className="h-full">
              <CardContent>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h2 className="mt-4 font-semibold">Analyser mon profil</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Voir mon score et mes statistiques GitHub
                </p>
              </CardContent>
            </Card>
          </Link>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Link href="/dashboard/saved">
            <Card interactive className="h-full">
              <CardContent>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="mt-4 font-semibold">Mes profils sauvegardés</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Retrouver les profils analysés précédemment
                </p>
              </CardContent>
            </Card>
          </Link>
        </FadeIn>
      </div>

      <FadeIn delay={0.3}>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary" size="sm">
            Se déconnecter
          </Button>
        </form>
      </FadeIn>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
        <Card><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    </div>
  )
}