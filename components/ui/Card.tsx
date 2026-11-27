// components/ui/Card.tsx

import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Ajoute un effet de survol (bordure accent) */
  interactive?: boolean
}

/**
 * Carte de base : surface blanche/zinc-900, bordure subtile, coins arrondis.
 * Utilisée partout dans le dashboard.
 */
export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${
        interactive
          ? 'transition-all duration-200 hover:border-blue-500 hover:shadow-md dark:hover:border-blue-500'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-zinc-100 px-6 py-4 dark:border-zinc-800 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h2 className={`text-base font-semibold tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>
}