import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import type { Role } from '@/config/roles'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/features/auth/auth-context'

interface ProtectedRouteProps {
  /** If omitted, any signed-in, approved user may enter. */
  allowedRoles?: Role[]
  /**
   * Grants entry to a staff member whose Staff.Specialization matches, even
   * if their role isn't in allowedRoles — e.g. a Nurse specialized in
   * Laboratory can reach the lab queue alongside LabStaff. Only ever widens
   * access; allowedRoles alone is still sufficient on its own.
   */
  allowedSpecializations?: string[]
  /**
   * Lets a PendingApproval user through instead of bouncing to the waiting
   * page. Needed for the student onboarding routes (medical profile,
   * documents) — a newly-registered student IS PendingApproval, and has to
   * reach those pages to ever get verified in the first place. The real
   * enforcement (e.g. blocking appointment booking) still happens server-side
   * regardless of this flag — see the class doc below.
   */
  allowPending?: boolean
}

/**
 * Route guard. Wrap route groups in this to require a session, and optionally
 * a role.
 *
 * This is a usability control, not a security control — it only decides what
 * the browser renders. Every endpoint must independently enforce
 * authorization on the server, because anyone can edit client-side state.
 */
export function ProtectedRoute({ allowedRoles, allowedSpecializations, allowPending }: ProtectedRouteProps) {
  const { status, user, hasRole } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageSpinner />
  }

  if (status !== 'authenticated' || !user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (user.status === 'PendingApproval' && !allowPending) {
    return <Navigate to={ROUTES.pendingApproval} replace />
  }

  // A temporary (admin-issued) password must be replaced before anything
  // else — checked here so a direct URL visit can't skip past it, not just
  // the post-login redirect in LoginPage.
  if (user.mustChangePassword && location.pathname !== ROUTES.changePassword) {
    return <Navigate to={ROUTES.changePassword} replace />
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    const specializationMatch =
      allowedSpecializations && !!user.specialization && allowedSpecializations.includes(user.specialization)
    if (!specializationMatch) {
      return <Navigate to={ROUTES.forbidden} replace />
    }
  }

  return <Outlet />
}
