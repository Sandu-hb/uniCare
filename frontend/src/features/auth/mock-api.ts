import { ROLES, type Role } from '@/config/roles'
import type { AccountStatus, CurrentUser, LoginRequest, LoginResponse } from './types'

/**
 * In-memory stand-in for the real ASP.NET Core auth endpoints, selected by
 * VITE_USE_MOCK_AUTH in api.ts. Delays every call so loading states are
 * actually visible instead of resolving instantly.
 */
const RESPONSE_DELAY_MS = 600

interface MockAccount {
  id: string
  email: string
  password: string
  fullName: string
  roles: Role[]
  status: AccountStatus
}

const accounts: MockAccount[] = [
  {
    id: 'u-student-1',
    email: 'student@uom.lk',
    password: 'Passw0rd',
    fullName: 'Nadeesha Perera',
    roles: [ROLES.Student],
    status: 'Active',
  },
  {
    id: 'u-doctor-1',
    email: 'doctor@uom.lk',
    password: 'Passw0rd',
    fullName: 'Dr. Ishara Wickramasinghe',
    roles: [ROLES.Doctor],
    status: 'Active',
  },
  {
    id: 'u-nurse-1',
    email: 'nurse@uom.lk',
    password: 'Passw0rd',
    fullName: 'Kavindi Silva',
    roles: [ROLES.Nurse],
    status: 'PendingApproval',
  },
]

export class AuthApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, RESPONSE_DELAY_MS))
}

function toUser(account: MockAccount): CurrentUser {
  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    roles: account.roles,
    status: account.status,
  }
}

// Mirrors a JWT closely enough for the client: opaque, and traceable back to
// the account it was minted for.
function tokenFor(account: MockAccount): string {
  return `mock.${account.id}`
}

export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
  await delay()
  const account = accounts.find((a) => a.email === email)
  if (!account || account.password !== password) {
    throw new AuthApiError(401, 'Email or password is incorrect.')
  }
  if (account.status === 'Suspended') {
    throw new AuthApiError(403, 'This account has been suspended. Contact the medical centre.')
  }
  return { token: tokenFor(account), user: toUser(account) }
}

export async function me(token: string): Promise<CurrentUser> {
  await delay()
  const account = accounts.find((a) => tokenFor(a) === token)
  if (!account) {
    throw new AuthApiError(401, 'Session expired. Sign in again.')
  }
  if (account.status === 'Suspended') {
    throw new AuthApiError(403, 'This account has been suspended. Contact the medical centre.')
  }
  return toUser(account)
}

export async function logout(): Promise<void> {
  await delay()
}
