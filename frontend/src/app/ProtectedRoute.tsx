import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@/config/roles'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/auth-context'

interface ProtectedRouteProps {
  /** If omitted, any signed-in user may enter. */
  allowedRoles?: Role[]
}

/**
 * Route guard. Wrap route groups in this to require a session, and optionally a
 * role.
 *
 * This is a usability control, not a security control — it only decides what the
 * browser renders. Every endpoint must independently enforce authorization on the
 * server, because anyone can edit client-side state.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
