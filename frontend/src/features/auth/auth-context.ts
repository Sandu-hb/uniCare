import { createContext, use } from 'react'
import type { Role } from '@/config/roles'
import type { CurrentUser, LoginResponse, SessionStatus } from './types'

export interface AuthContextValue {
  user: CurrentUser | null
  status: SessionStatus
  isAuthenticated: boolean
  hasRole: (...roles: Role[]) => boolean
  login: (email: string, password: string) => Promise<CurrentUser>
  /**
   * Adopts an already-issued token pair as the current session, without
   * calling the login API again — for anything that logs a user in as a
   * side effect of something else (self-registration auto-logging the
   * student in right after their account is created).
   */
  establishSession: (response: LoginResponse) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
