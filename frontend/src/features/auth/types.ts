import type { Role } from '@/config/roles'

export type AccountStatus = 'Active' | 'PendingApproval' | 'Suspended'

/** Session lifecycle as tracked by AuthProvider: unknown yet, signed in, or not. */
export type SessionStatus = 'loading' | 'authenticated' | 'anonymous'

export interface CurrentUser {
  id: string
  fullName: string
  email: string
  roles: Role[]
  status: AccountStatus
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: CurrentUser
}
