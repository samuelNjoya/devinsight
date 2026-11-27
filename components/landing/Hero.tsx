// components/landing/Hero.tsx

'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()

    if (!trimmed) {
      setError('Entre un username GitHub')
      return
    }
    if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(trimmed)) {
      setError('Username GitHub invalide')
      return
    }
    router.push(`/u/${trimmed}`)
  }

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      {/* Gradient de fond subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent dark:from-blue-950/30"
      />

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Analyse GitHub instantanée
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl"
        >
          Analyse ton profil GitHub
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            en un clin d&apos;œil.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400"
        >
          Obtiens un score de 0 à 100, visualise tes langages, ton activité et tes
          meilleurs repos. Compare-toi aux autres développeurs.
        </motion.p>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-xl"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-400">
                github.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(null)
                }}
                placeholder="username"
                aria-label="Username GitHub"
                aria-invalid={Boolean(error)}
                className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-[6.5rem] pr-4 text-sm shadow-sm transition-colors placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <Button type="submit" size="lg" className="shrink-0">
              Analyser
            </Button>
          </div>
          {error && <p className="mt-2 text-left text-sm text-red-600">{error}</p>}
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 text-sm text-zinc-500 dark:text-zinc-400"
        >
          Ou{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            connecte-toi avec GitHub
          </Link>{' '}
          pour accéder aux dépôts privés.
        </motion.p>
      </div>
    </section>
  )
}