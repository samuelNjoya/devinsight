// lib/supabase/server.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

/**
 * Client Supabase côté serveur (Server Components, Route Handlers, Server Actions).
 * Gère les cookies de session automatiquement.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Appelé depuis un Server Component → les cookies ne peuvent pas
          // être écrits. C'est OK : le middleware s'en charge.
        }
      },
    },
  })
}

/**
 * Client admin (service_role) — contourne RLS.
 * À utiliser UNIQUEMENT pour les opérations serveur qui nécessitent
 * un accès total (ex : stocker le provider_token à la place de l'user).
 * Ne JAMAIS exposer au client.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(config.supabase.url, config.supabase.serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}