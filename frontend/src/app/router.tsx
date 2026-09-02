import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES, STAFF_ROLES } from '@/config/roles'
import { ROUTES } from '@/config/routes'
import { StudentsPage } from '@/features/students/StudentsPage'
import { SystemStatusPage } from '@/features/system/SystemStatusPage'
import { AuthLayout } from '@/layouts/AuthLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { ProtectedRoute } from './ProtectedRoute'

/**
 * The whole route tree. Guards wrap route *groups*, so adding a page inside a
 * group inherits its protection automatically — you cannot forget to guard it.
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.systemStatus} element={<SystemStatusPage />} />
      {/* TODO(auth): move inside ProtectedRoute allowedRoles={STAFF_ROLES} once login exists */}
      <Route path="/students" element={<StudentsPage />} />
      <Route element={<AuthLayout />}>
        {/* TODO(auth): <Route path={ROUTES.login} element={<LoginPage />} /> */}
      </Route>

      {/* Student area */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.Student]} />}>
        <Route element={<StudentLayout />}>
          {/* TODO: student dashboard, medical profile, documents, appointments */}
        </Route>
      </Route>

      {/* Staff area */}
      <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
        <Route element={<StaffLayout />}>
          {/* TODO: staff dashboard, students, appointments, queue, pharmacy, lab */}
        </Route>
      </Route>

      {/* Until login exists, land on the status page so the app is verifiable. */}
      <Route path="*" element={<Navigate to={ROUTES.systemStatus} replace />} />
    </Routes>
  )
}
