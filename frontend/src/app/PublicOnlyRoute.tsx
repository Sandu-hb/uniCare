import { Navigate, Outlet } from 'react-router-dom'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import { dashboardFor, ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/auth-context'

/**
 * Keeps signed-in users off sign-in/registration pages — landing back on
 * /login after already authenticating is confusing, not helpful.
 */
export function PublicOnlyRoute() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <FullPageSpinner />
  }

  if (status === 'authenticated' && user) {
    if (user.status === 'PendingApproval') {
      return <Navigate to={ROUTES.pendingApproval} replace />
    }
    return <Navigate to={dashboardFor(user.roles)} replace />
  }

  return <Outlet />
}
