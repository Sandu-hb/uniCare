import { useMemo, useState, type ReactNode } from 'react'
import { setToken } from '@/lib/api-client'
import { AuthContext, type AuthContextValue } from './auth-context'
import type { CurrentUser } from './types'

/**
 * Holds the signed-in user for the whole app. Kept in its own file so it exports
 * only a component — the context and the useAuth hook live in auth-context.ts,
 * which is what React Fast Refresh needs.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO(auth): restore the session on load by calling GET /api/auth/me with the
  // stored token, once the backend exposes it. Until then a refresh signs out.
  const [user, setUser] = useState<CurrentUser | null>(null)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      hasRole: (...roles) => user !== null && roles.some((r) => user.roles.includes(r)),
      signIn: (token, nextUser) => {
        setToken(token)
        setUser(nextUser)
      },
      signOut: () => {
        setToken(null)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
