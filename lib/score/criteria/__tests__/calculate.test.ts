// lib/score/__tests__/calculate.test.ts

import { describe, it, expect } from 'vitest'
import { calculateScore, CRITERIA } from '../../calculate'
import type { ProfileData } from '@/lib/github/types'

function makeEmptyProfile(): ProfileData {
  return {
    user: {
      login: 'test',
      name: null,
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
    // events:[],
    contributions: { totalContributions: 0, days: [] },
    languages: {},
    includesPrivate: false,
    analyzedAt: new Date().toISOString(),
  }
}

describe('CRITERIA', () => {
  it('les poids somment à 1.0', () => {
    const sum = CRITERIA.reduce((acc, c) => acc + c.weight, 0)
    expect(sum).toBeCloseTo(1.0, 5)
  })

  it('chaque critère a un id unique', () => {
    const ids = CRITERIA.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('calculateScore', () => {
  it('retourne 0 pour un profil vide', () => {
    const result = calculateScore(makeEmptyProfile())
    expect(result.total).toBe(0)
  })

  it('retourne un score entre 0 et 100', () => {
    const result = calculateScore(makeEmptyProfile())
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  it('le breakdown contient tous les critères', () => {
    const result = calculateScore(makeEmptyProfile())
    expect(result.breakdown).toHaveLength(CRITERIA.length)
  })
})