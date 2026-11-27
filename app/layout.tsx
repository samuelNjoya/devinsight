// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { HeaderWrapper } from '@/components/layout/HeaderWrapper'
import { Footer } from '@/components/layout/Footer'
import { AppShell } from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevInsight — Analyse ton profil GitHub',
  description:
    'Analyse ton profil GitHub, obtiens un score de 0 à 100, et compare-toi aux autres développeurs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <HeaderWrapper />
          <AppShell>{children}</AppShell>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}