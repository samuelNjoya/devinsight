// lib/errors.ts

/**
 * Erreurs applicatives typées.
 * Chaque erreur porte un code HTTP et un code machine stable,
 * pour que les route handlers puissent répondre proprement.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class GitHubNotFoundError extends AppError {
  constructor(username: string) {
    super(`Utilisateur GitHub introuvable : ${username}`, 'GITHUB_NOT_FOUND', 404)
  }
}

export class GitHubRateLimitError extends AppError {
  constructor(public readonly retryAfterSeconds: number) {
    super(
      `Quota GitHub dépassé. Réessaie dans ${retryAfterSeconds}s.`,
      'GITHUB_RATE_LIMIT',
      429
    )
  }
}

export class GitHubAuthError extends AppError {
  constructor() {
    super('Token GitHub invalide ou expiré', 'GITHUB_AUTH', 401)
  }
}

export class GitHubServerError extends AppError {
  constructor(status: number) {
    super(`Erreur GitHub (${status})`, 'GITHUB_SERVER', 502)
  }
}

export class InvalidUsernameError extends AppError {
  constructor(message: string) {
    super(message, 'INVALID_USERNAME', 400)
  }
}

export class CacheError extends AppError {
  constructor(message: string) {
    super(`Cache indisponible : ${message}`, 'CACHE_ERROR', 503)
  }
}