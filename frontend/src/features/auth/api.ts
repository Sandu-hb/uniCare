import { apiClient } from '@/lib/api-client'
import { readRefreshToken, readToken } from '@/lib/token-storage'
import * as mockApi from './mock-api'
import type { CurrentUser, LoginRequest, LoginResponse, RefreshResponse } from './types'

/**
 * Switches between the in-memory mock and the real backend by one env flag,
 * so the login screen can ship before the .NET auth endpoints exist. Flip
 * VITE_USE_MOCK_AUTH to "false" once they're ready — nothing else changes.
 */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

function normalize(request: LoginRequest): LoginRequest {
  return { email: request.email.trim().toLowerCase(), password: request.password }
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const payload = normalize(request)
  if (USE_MOCK_AUTH) return mockApi.login(payload)

  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  if (USE_MOCK_AUTH) return mockApi.refresh(refreshToken)

  const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken })
  return data
}

export async function me(): Promise<CurrentUser> {
  if (USE_MOCK_AUTH) {
    const token = readToken()
    if (!token) throw new mockApi.AuthApiError(401, 'Not signed in.')
    return mockApi.me(token)
  }

  const { data } = await apiClient.get<CurrentUser>('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  const refreshToken = readRefreshToken()
  if (USE_MOCK_AUTH) return mockApi.logout()
  if (refreshToken) {
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => {
      // Ignore network errors during logout
    })
  }
}
