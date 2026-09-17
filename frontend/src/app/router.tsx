import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES, STAFF_ROLES } from '@/config/roles'
import { ROUTES } from '@/config/routes'
import { MyStaffAppointmentsPage } from '@/features/appointments/MyStaffAppointmentsPage'
import { StaffAppointmentsPage } from '@/features/appointments/StaffAppointmentsPage'
import { StudentAppointmentsPage } from '@/features/appointments/StudentAppointmentsPage'
import { ChooseRolePage } from '@/features/auth/ChooseRolePage'
import { ForbiddenPage } from '@/features/auth/ForbiddenPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { PendingApprovalPage } from '@/features/auth/PendingApprovalPage'
import { RegisterStaffPage } from '@/features/auth/RegisterStaffPage'
import { RegisterStudentPage } from '@/features/auth/RegisterStudentPage'
import { StaffDashboardPage } from '@/features/dashboard/StaffDashboardPage'
import { StudentDashboardPage } from '@/features/dashboard/StudentDashboardPage'
import { MedicalProfilePage } from '@/features/medical-profiles/MedicalProfilePage'
import { StudentsPage } from '@/features/students/StudentsPage'
import { SystemStatusPage } from '@/features/system/SystemStatusPage'
import { QueuePage } from '@/features/visits/QueuePage'
import { AuthLayout } from '@/layouts/AuthLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { DocumentsPage } from '@/features/medical-documents/DocumentsPage'

/**
 * The whole route tree. Guards wrap route *groups*, so adding a page inside a
 * group inherits its protection automatically — you cannot forget to guard it.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>

        <Route path={ROUTES.register} element={<ChooseRolePage />} />
        <Route path={ROUTES.registerStudent} element={<RegisterStudentPage />} />
        <Route path={ROUTES.registerStaff} element={<RegisterStaffPage />} />
      </Route>

      <Route path={ROUTES.pendingApproval} element={<PendingApprovalPage />} />
      <Route path={ROUTES.forbidden} element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
        <Route element={<StaffLayout />}>
          <Route path={ROUTES.staff.dashboard} element={<StaffDashboardPage />} />
          <Route path={ROUTES.systemStatus} element={<SystemStatusPage />} />
          <Route path="/students/:studentId/documents" element={<DocumentsPage />} />
          {/* StudentsPage/MedicalProfilePage link to these exact paths directly, not via ROUTES.staff.students */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:studentId/medical-profile" element={<MedicalProfilePage />} />
          <Route path={ROUTES.staff.queue} element={<QueuePage />} />

          <Route element={<ProtectedRoute allowedRoles={[ROLES.Admin]} />}>
            <Route path={ROUTES.staff.appointments} element={<StaffAppointmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.Doctor, ROLES.Nurse]} />}>
            <Route path={ROUTES.staff.myAppointments} element={<MyStaffAppointmentsPage />} />
          </Route>
        </Route>
      </Route>

      {/* allowPending: a newly-registered student IS PendingApproval and must
          reach Medical Profile/Documents to ever get verified. The real gate
          (e.g. blocking appointment booking) is enforced server-side; these
          pages themselves show the right state for a pending account. */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.Student]} allowPending />}>
        <Route element={<StudentLayout />}>
          <Route path={ROUTES.student.dashboard} element={<StudentDashboardPage />} />
          <Route path={ROUTES.student.appointments} element={<StudentAppointmentsPage />} />
          <Route path={ROUTES.student.medicalProfile} element={<MedicalProfilePage />} />
          <Route path={ROUTES.student.documents} element={<DocumentsPage />} />
          {/* TODO: prescriptions, reports */}
        </Route>
      </Route>

      <Route path={ROUTES.root} element={<Navigate to={ROUTES.login} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
    </Routes>
  )
}
