// app/api/github/__tests__/route.test.ts

import { describe, it, expect, vi } from 'vitest'
import { GET } from '../[username]/route'

vi.mock('@/lib/rate-limit', () => ({
  anonymousLimiter: { limit: vi.fn().mockResolvedValue({ success: true, reset: Date.now() + 60000 }) },
  authenticatedLimiter: { limit: vi.fn() },
  getClientIp: vi.fn().mockReturnValue('1.2.3.4'),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  }),
}))

vi.mock('@/lib/cache/redis', () => ({
  getCache: vi.fn().mockReturnValue({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  }),
  cacheKeys: { profile: vi.fn().mockReturnValue('test-key') },
}))

describe('GET /api/github/[username]', () => {
  it('rejette un username invalide', async () => {
    const request = new Request('http://localhost:3000/api/github/-invalid')
    const response = await GET(request, { params: Promise.resolve({ username: '-invalid' }) })
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('INVALID_USERNAME')
  })
})