import { createContext, use } from 'react'
import type { Role } from '@/config/roles'
import type { CurrentUser } from './types'

export interface AuthContextValue {
  user: CurrentUser | null
  isAuthenticated: boolean
  hasRole: (...roles: Role[]) => boolean
  signIn: (token: string, user: CurrentUser) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
