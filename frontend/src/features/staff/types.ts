import type { AccountStatus } from '@/features/auth/types'

/** Mirrors UniCare.Domain.Enums.StaffRole, serialized as text by the API. */
export type StaffRole = 'Unassigned' | 'Admin' | 'Doctor' | 'Nurse' | 'LabStaff' | 'PharmacyStaff'

/** Every assignable role — used by the Staff page's role filter. */
export const STAFF_ROLES: StaffRole[] = ['Admin', 'Doctor', 'Nurse', 'LabStaff', 'PharmacyStaff']

/** Roles an admin can hand-pick when adding staff through the "Add staff" form. */
export const CREATABLE_STAFF_ROLES: StaffRole[] = ['Doctor', 'Nurse']

export const SPECIALIZATIONS = ['Clinical', 'Dental', 'Laboratory', 'Pharmacy'] as const
export type Specialization = (typeof SPECIALIZATIONS)[number]

/** Mirrors StaffDto. */
export interface Staff {
  id: string
  staffNumber: string
  fullName: string
  email: string
  role: StaffRole
  specialization: string | null
  licenseNumber: string | null
  contactNumber: string | null
  isActive: boolean
  accountStatus: AccountStatus

  /**
   * Only set on the response to a create call that generated a temporary
   * password: true if the welcome email carrying it was delivered, false if
   * it could not be sent. The password itself is never sent to the client.
   */
  welcomeEmailSent: boolean | null
}

/**
 * Mirrors CreateStaffRequest — admin-created, active immediately. Password is
 * omitted: the server generates a temporary one and returns it once via
 * Staff.generatedPassword.
 */
export interface CreateStaffRequest {
  email: string
  fullName: string
  role: StaffRole
  specialization?: string | null
  licenseNumber?: string | null
  contactNumber?: string | null
}
