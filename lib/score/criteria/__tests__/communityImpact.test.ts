// lib/score/criteria/__tests__/communityImpact.test.ts

import { describe, it, expect } from 'vitest'
import { communityImpact } from '../communityImpact'
import type { ProfileData } from '@/lib/github/types'

function makeProfile(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    user: {
      login: 'test',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      bio: null,
      company: null,
      location: null,
      blog: null,
      publicRepos: 0,
      followers: 0,
      following: 0,
      createdAt: '2020-01-01T00:00:00Z',
      htmlUrl: 'https://github.com/test',
    },
    repos: [],
    // events: [],
    contributions: { totalContributions: 0, days: [] },
    languages: {},
    includesPrivate: false,
    analyzedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('communityImpact', () => {
  it('retourne 0 sans aucun repo', () => {
    expect(communityImpact.compute(makeProfile())).toBe(0)
  })

  it('retourne 100 avec 10000 stars', () => {
    const profile = makeProfile({
      repos: [
        {
          name: 'repo',
          description: 'desc',
          language: 'TS',
          stars: 10000,
          forks: 0,
          isPrivate: false,
          hasReadme: true,
          hasLicense: true,
          topics: ['x'],
          updatedAt: '2024-01-01T00:00:00Z',
          htmlUrl: 'https://github.com/test/repo',
        },
      ],
    })
    expect(communityImpact.compute(profile)).toBe(100)
  })

  it('applique un log pour éviter l\'écrasement', () => {
    const profile = makeProfile({
      repos: [
        {
          name: 'repo',
          description: 'desc',
          language: 'TS',
          stars: 100,
          forks: 0,
          isPrivate: false,
          hasReadme: true,
          hasLicense: true,
          topics: ['x'],
          updatedAt: '2024-01-01T00:00:00Z',
          htmlUrl: 'https://github.com/test/repo',
        },
      ],
    })
    const score = communityImpact.compute(profile)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })
})