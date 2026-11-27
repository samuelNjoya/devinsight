// components/layout/Footer.tsx

import Link from 'next/link'

export function Footer() {
//   const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {/* © {year} DevInsight. Tous droits réservés. */}
           © 2026 DevInsight. Tous droits réservés.
        </p>

        <nav className="flex items-center gap-4 text-xs" aria-label="Liens de pied de page">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            GitHub
          </a>
          <Link
            href="/"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Docs
          </Link>
          <span className="text-zinc-500 dark:text-zinc-400">
            Built with Next.js + Supabase
          </span>
        </nav>
      </div>
    </footer>
  )
}