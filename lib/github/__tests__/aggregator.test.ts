// lib/github/__tests__/aggregator.test.ts

import { describe, it, expect } from 'vitest'
import { computeLanguages } from '../aggregator'
import type { GitHubRepoSummary } from '../types'

function makeRepo(language: string | null): GitHubRepoSummary {
  return {
    name: 'r',
    description: null,
    language,
    stars: 0,
    forks: 0,
    isPrivate: false,
    hasReadme: false,
    hasLicense: false,
    topics: [],
    updatedAt: '2024-01-01T00:00:00Z',
    htmlUrl: 'https://github.com/x/r',
  }
}

describe('computeLanguages', () => {
  it('compte les langages correctement', () => {
    const result = computeLanguages([
      makeRepo('TypeScript'),
      makeRepo('TypeScript'),
      makeRepo('Python'),
      makeRepo(null),
    ])
    expect(result).toEqual({ TypeScript: 2, Python: 1 })
  })

  it('retourne un objet vide sans repo', () => {
    expect(computeLanguages([])).toEqual({})
  })
})