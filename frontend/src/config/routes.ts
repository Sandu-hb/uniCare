/**
 * Route paths in one place so links and guards cannot drift apart.
 */
export const ROUTES = {
  login: '/login',
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
