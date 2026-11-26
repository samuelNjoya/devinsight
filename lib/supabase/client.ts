// lib/supabase/client.ts

// 'use client'

// import { createBrowserClient } from '@supabase/ssr'
// import { config } from '@/lib/config'

// /**
//  * Client Supabase côté navigateur (Client Components).
//  * Utilise la clé anon → protégé par RLS.
//  * Ne JAMAIS utiliser la service_role key ici.
//  */
// export function createClient() {
//   return createBrowserClient(config.supabase.url, config.supabase.anonKey)
// }

// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ou PUBLISHABLE_KEY selon ton nom
  )
}