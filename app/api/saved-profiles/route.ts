// app/api/saved-profiles/route.ts

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { AppError } from '@/lib/errors'

// const saveProfileSchema = z.object({
//   githubUsername: z.string().min(1).max(39),
//   score: z.number().int().min(0).max(100),
//   snapshot: z.record(z.unknown()),
// })

const saveProfileSchema = z.object({
  githubUsername: z.string().min(1).max(39),
  score: z.number().int().min(0).max(100),
  snapshot: z.record(z.string(), z.unknown()),
})

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('saved_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'DB_ERROR', message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ profiles: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Connexion requise.' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const parsed = saveProfileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_BODY', message: parsed.error.issues[0]?.message },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('saved_profiles')
    .insert({
      user_id: user.id,
      github_username: parsed.data.githubUsername,
      score: parsed.data.score,
      snapshot: parsed.data.snapshot,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'DB_ERROR', message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ profile: data }, { status: 201 })
}