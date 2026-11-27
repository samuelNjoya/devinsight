// components/layout/HeaderWrapper.tsx

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from './Header'

/**
 * Lit la session dans un Suspense, puis passe `user` au Header (Client).
 * Le Header est un Client Component, mais il reçoit `user` en prop
 * depuis ce Server Component.
 */
export function HeaderWrapper() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderWithSession />
    </Suspense>
  )
}

async function HeaderWithSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <Header user={user} />
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-transparent">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </header>
  )
}