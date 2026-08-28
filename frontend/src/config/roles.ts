/**
 * The eight roles from the SRS. These strings must match the backend's role
 * claims exactly — a typo here silently locks people out of their own pages.
 */
export const ROLES = {
  Student: 'Student',
  Admin: 'Admin',
  Nurse: 'Nurse',
  Doctor: 'Doctor',
  Dentist: 'Dentist',
  LabStaff: 'LabStaff',
  PharmacyStaff: 'PharmacyStaff',
  SystemAdmin: 'SystemAdmin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Every role except Student — i.e. anyone who works at the medical center. */
export const STAFF_ROLES: Role[] = [
  ROLES.Admin,
  ROLES.Nurse,
  ROLES.Doctor,
  ROLES.Dentist,
  ROLES.LabStaff,
  ROLES.PharmacyStaff,
  ROLES.SystemAdmin,
]

/** Roles permitted to record clinical findings against a patient. */
export const CLINICAL_ROLES: Role[] = [ROLES.Nurse, ROLES.Doctor, ROLES.Dentist]
