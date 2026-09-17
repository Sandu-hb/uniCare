/**
 * Four roles: a student, and three staff portals. Dentists register as
 * Doctor (distinguished via Staff.Specialization); the pharmacy and lab
 * each run off one shared account rather than per-person logins. These
 * strings must match the backend's role claims exactly — a typo here
 * silently locks people out of their own pages.
 */
export const ROLES = {
  Student: 'Student',
  Admin: 'Admin',
  Doctor: 'Doctor',
  LabStaff: 'LabStaff',
  PharmacyStaff: 'PharmacyStaff',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Every role except Student — i.e. anyone who works at the medical center. */
export const STAFF_ROLES: Role[] = [
  ROLES.Admin,
  ROLES.Doctor,
  ROLES.LabStaff,
  ROLES.PharmacyStaff,
]

export function isStaffRole(role: Role): boolean {
  return (STAFF_ROLES as string[]).includes(role)
}
