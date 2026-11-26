// tests/msw/server.ts

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.github.com/users/:username', ({ params }) => {
    if (params.username === 'unknown') {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      login: params.username,
      name: 'Test User',
      avatar_url: 'https://example.com/a.png',
      bio: 'bio',
      company: null,
      location: null,
      blog: 'https://blog.com',
      public_repos: 3,
      followers: 10,
      following: 5,
      created_at: '2020-01-01T00:00:00Z',
      html_url: `https://github.com/${params.username}`,
    })
  }),
  http.get('https://api.github.com/users/:username/repos', () => {
    return HttpResponse.json([
      {
        name: 'repo1',
        description: 'desc',
        language: 'TypeScript',
        stargazers_count: 42,
        forks_count: 5,
        private: false,
        license: { key: 'mit' },
        topics: ['nextjs'],
        updated_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/x/repo1',
      },
    ])
  }),
  http.get('https://api.github.com/users/:username/events/public', () => {
    return HttpResponse.json([
      { type: 'PushEvent', created_at: new Date().toISOString() },
    ])
  }),
]

export const server = setupServer(...handlers)