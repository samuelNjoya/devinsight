// lib/validation/__tests__/username.test.ts

import { describe, it, expect } from 'vitest'
import { validateUsername } from '../../../validation/username'

describe('validateUsername', () => {
  it.each(['octocat', 'user-name', 'a', 'user123', 'User-Name-123'])(
    'accepte %s',
    (input) => {
      expect(validateUsername(input).ok).toBe(true)
    }
  )

  it.each([
    ['', 'vide'],
    ['-start', 'commence par tiret'],
    ['end-', 'finit par tiret'],
    ['double--dash', 'tirets consécutifs'],
    ['with_underscore', 'underscore interdit'],
    ['with.dot', 'point interdit'],
    ['a'.repeat(40), 'trop long'],
  ])('rejette "%s" (%s)', (input) => {
    expect(validateUsername(input).ok).toBe(false)
  })

  it('trim les espaces', () => {
    const result = validateUsername('  octocat  ')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toBe('octocat')
  })
})