// app/not-found.tsx

import { EmptyState } from '@/components/ui/EmptyState'
import { ButtonLink } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem-5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent>
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 9v4M12 17h.01" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            }
            title="Page introuvable"
            description="La page que tu cherches n'existe pas ou a été déplacée."
            action={<ButtonLink href="/">Retour à l'accueil</ButtonLink>}
          />
        </CardContent>
      </Card>
    </div>
  )
}