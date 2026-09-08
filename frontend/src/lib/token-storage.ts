const TOKEN_KEY = 'unicare.token'
const REFRESH_TOKEN_KEY = 'unicare.refresh_token'

/**
 * The only module that touches localStorage for auth. Everything else calls
 * these functions, so swapping to an httpOnly refresh cookie later is a
 * one-file change. The in-memory cache means a blocked or throwing
 * localStorage (private browsing, locked-down browsers) only costs
 * persistence across reloads, not the current session.
 */
let cachedToken: string | null | undefined
let cachedRefreshToken: string | null | undefined

export function readToken(): string | null {
  if (cachedToken !== undefined) return cachedToken
  try {
    cachedToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    cachedToken = null
  }
  return cachedToken
}

export function readRefreshToken(): string | null {
  if (cachedRefreshToken !== undefined) return cachedRefreshToken
  try {
    cachedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    cachedRefreshToken = null
  }
  return cachedRefreshToken
}

export function writeToken(token: string): void {
  cachedToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Non-fatal: user stays signed in for this tab.
  }
}

export function writeRefreshToken(refreshToken: string): void {
  cachedRefreshToken = refreshToken
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } catch {
    // Non-fatal.
  }
}

export function writeTokens(token: string, refreshToken: string): void {
  writeToken(token)
  writeRefreshToken(refreshToken)
}

export function clearToken(): void {
  cachedToken = null
  cachedRefreshToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Non-fatal.
  }
}
