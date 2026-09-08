import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearToken, readToken, writeToken } from '@/lib/token-storage'
import * as authApi from './api'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { CurrentUser, SessionStatus } from './types'

/**
 * Holds the signed-in user for the whole app. Kept in its own file so it
 * exports only a component — the context and the useAuth hook live in
 * auth-context.ts, which is what React Fast Refresh needs.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  // A token in storage means the session needs verifying before we know the
  // status; with no token there is nothing to check, so start anonymous.
  const [status, setStatus] = useState<SessionStatus>(() =>
    readToken() ? 'loading' : 'anonymous',
  )

  // Restore the session on load: a stored token is checked against the
  // server (or mock) rather than trusted blindly, since it may have expired.
  useEffect(() => {
    const token = readToken()
    if (!token) return

    let cancelled = false
    authApi
      .me()
      .then((restoredUser) => {
        if (cancelled) return
        setUser(restoredUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setUser(null)
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      hasRole: (...roles) => user !== null && roles.some((r) => user.roles.includes(r)),
      login: async (email, password) => {
        const { token, user: nextUser } = await authApi.login({ email, password })
        writeToken(token)
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      },
      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          clearToken()
          setUser(null)
          setStatus('anonymous')
        }
      },
    }),
    [user, status],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
