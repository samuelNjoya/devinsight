// app/auth/__tests__/callback.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../callback/route'

// Mock des clients Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}))

import { createClient, createAdminClient } from '@/lib/supabase/server'

describe('GET /auth/callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirige avec erreur si pas de code', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('error=missing_code')
  })

  it('stocke le provider_token si présent', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    const mockAdmin = { from: vi.fn().mockReturnValue({ upsert: mockUpsert }) }

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123' },
              provider_token: 'ghp_test_token',
            },
          },
          error: null,
        }),
      },
    } as never)

    vi.mocked(createAdminClient).mockResolvedValue(mockAdmin as never)

    const request = new Request('http://localhost:3000/auth/callback?code=test_code')
    await GET(request)

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        provider: 'github',
        access_token: 'ghp_test_token',
      }),
      { onConflict: 'user_id,provider' }
    )
  })
})