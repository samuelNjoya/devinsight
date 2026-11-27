// app/error.tsx

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app/error]', error)
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-4rem-5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent>
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            }
            title="Une erreur est survenue"
            description="Quelque chose s'est mal passé. Tu peux réessayer ou revenir à l'accueil."
            action={
              <div className="flex gap-2">
                <Button onClick={reset}>Réessayer</Button>
                <Button variant="secondary" onClick={() => (window.location.href = '/')}>
                  Accueil
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}