// app/u/[username]/not-found.tsx

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
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M8 11h6" />
              </svg>
            }
            title="Profil introuvable"
            description="Cet utilisateur GitHub n'existe pas ou n'est pas accessible."
            action={<ButtonLink href="/">Retour à l'accueil</ButtonLink>}
          />
        </CardContent>
      </Card>
    </div>
  )
}