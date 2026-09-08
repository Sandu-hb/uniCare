import { isStaffRole, type Role } from './roles'

/**
 * Route paths in one place so links and guards cannot drift apart.
 */
export const ROUTES = {
  root: '/',
  login: '/login',
  register: '/register',
  registerStudent: '/register/student',
  registerStaff: '/register/staff',
  forgotPassword: '/forgot-password',
  pendingApproval: '/pending-approval',
  forbidden: '/forbidden',
  systemStatus: '/system-status',

  student: {
    dashboard: '/student',
    medicalProfile: '/student/medical-profile',
    documents: '/student/documents',
    appointments: '/student/appointments',
    prescriptions: '/student/prescriptions',
    reports: '/student/reports',
  },

  staff: {
    dashboard: '/staff',
    students: '/staff/students',
    appointments: '/staff/appointments',
    queue: '/staff/queue',
    consultations: '/staff/consultations',
    pharmacy: '/staff/pharmacy',
    laboratory: '/staff/laboratory',
  },
} as const

/**
 * Where a signed-in user lands. A user can hold more than one role, so this
 * picks by category rather than a single Role → route map — a staff role of
 * any kind currently shares one dashboard, but the branch is here so specific
 * roles (e.g. Doctor) can get their own landing page later without touching
 * any component that calls this function.
 */
export function dashboardFor(roles: Role[]): string {
  return roles.some(isStaffRole) ? ROUTES.staff.dashboard : ROUTES.student.dashboard
}
