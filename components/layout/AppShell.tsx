// components/layout/AppShell.tsx

import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

/**
 * Wrapper de structure : main + footer.
 * Le Header est rendu séparément dans app/layout.tsx (car il lit la session).
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem-5rem)]">{children}</main>
  )
}