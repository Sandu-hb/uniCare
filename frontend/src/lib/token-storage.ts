const TOKEN_KEY = 'unicare.token'

/**
 * The only module that touches localStorage for auth. Everything else calls
 * these three functions, so swapping to an httpOnly refresh cookie later is a
 * one-file change. The in-memory cache means a blocked or throwing
 * localStorage (private browsing, locked-down browsers) only costs
 * persistence across reloads, not the current session.
 */
let cachedToken: string | null | undefined

export function readToken(): string | null {
  if (cachedToken !== undefined) return cachedToken
  try {
    cachedToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    cachedToken = null
  }
  return cachedToken
}

export function writeToken(token: string): void {
  cachedToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Non-fatal: the user stays signed in for this tab only.
  }
}

export function clearToken(): void {
  cachedToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Non-fatal.
  }
}
