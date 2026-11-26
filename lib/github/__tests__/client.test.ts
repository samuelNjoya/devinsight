// lib/github/__tests__/client.test.ts

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '@/tests/msw/server'
import { GitHubClient } from '../client'
import { GitHubNotFoundError } from '@/lib/errors'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GitHubClient', () => {
  const client = new GitHubClient({ token: 'test-token' })

  it('mappe correctement un user', async () => {
    const user = await client.getUser('octocat')
    expect(user.login).toBe('octocat')
    expect(user.followers).toBe(10)
    expect(user.avatarUrl).toBe('https://example.com/a.png')
  })

  it('throw GitHubNotFoundError sur 404', async () => {
    await expect(client.getUser('unknown')).rejects.toBeInstanceOf(GitHubNotFoundError)
  })
})