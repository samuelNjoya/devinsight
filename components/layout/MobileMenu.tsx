// components/layout/MobileMenu.tsx

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { User } from '@supabase/supabase-js'

interface MobileMenuProps {
  user: User | null
  onClose: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/saved', label: 'Saved' },
  { href: '/dashboard/compare', label: 'Compare' },
] as const

export function MobileMenu({ user, onClose }: MobileMenuProps) {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        aria-hidden
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-50 w-72 border-l border-zinc-200 bg-white p-6 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Menu mobile"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1" aria-label="Navigation mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          {user ? (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                Se déconnecter
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              Sign in
            </Link>
          )}
        </div>
      </motion.aside>
    </>
  )
}