import { createContext, use } from 'react'
import type { Role } from '@/config/roles'
import type { CurrentUser, SessionStatus } from './types'

export interface AuthContextValue {
  user: CurrentUser | null
  status: SessionStatus
  isAuthenticated: boolean
  hasRole: (...roles: Role[]) => boolean
  login: (email: string, password: string) => Promise<CurrentUser>
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
