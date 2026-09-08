import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import type { Role } from '@/config/roles'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/auth-context'

interface ProtectedRouteProps {
  /** If omitted, any signed-in, approved user may enter. */
  allowedRoles?: Role[]
}

/**
 * Route guard. Wrap route groups in this to require a session, and optionally
 * a role.
 *
 * This is a usability control, not a security control — it only decides what
 * the browser renders. Every endpoint must independently enforce
 * authorization on the server, because anyone can edit client-side state.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { status, user, hasRole } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageSpinner />
  }

  if (status !== 'authenticated' || !user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (user.status === 'PendingApproval') {
    return <Navigate to={ROUTES.pendingApproval} replace />
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to={ROUTES.forbidden} replace />
  }

  return <Outlet />
}
