import { z } from 'zod'

export const UNIVERSITY_DOMAIN = 'uom.lk'

/** Flip to true once faculty subdomains (e.g. med.uom.lk) need to sign in too. */
export const ALLOW_SUBDOMAINS = false

export function isUniversityEmail(email: string): boolean {
  const at = email.lastIndexOf('@')
  if (at === -1) return false
  const domain = email.slice(at + 1).toLowerCase()
  if (ALLOW_SUBDOMAINS) {
    return domain === UNIVERSITY_DOMAIN || domain.endsWith(`.${UNIVERSITY_DOMAIN}`)
  }
  return domain === UNIVERSITY_DOMAIN
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Enter your university email address.')
    .email('Enter a valid email address.')
    .refine(isUniversityEmail, `Use your @${UNIVERSITY_DOMAIN} email address.`),
  password: z.string().min(1, 'Enter your password.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerStudentSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Enter your university email address.')
      .email('Enter a valid email address.')
      .refine(isUniversityEmail, `Use your @${UNIVERSITY_DOMAIN} email address.`),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>

export const CLINICAL_ROLE_OPTIONS = [
  { value: 'Doctor', label: 'Medical Officer / General Physician' },
  { value: 'Dentist', label: 'Dental Surgeon / Dentist' },
  { value: 'Nurse', label: 'Nursing Officer / Staff Nurse' },
  { value: 'PharmacyStaff', label: 'Pharmacist / Pharmacy Staff' },
  { value: 'LabStaff', label: 'Laboratory Technician / Lab Staff' },
  { value: 'Admin', label: 'Medical Centre Administrator' },
  { value: 'SystemAdmin', label: 'System Administrator' },
] as const

export const registerStaffSchema = z
  .object({
    clinicalRole: z.string().min(1, 'Select your clinical role.'),
    email: z
      .string()
      .min(1, 'Enter your university email address.')
      .email('Enter a valid email address.')
      .refine(isUniversityEmail, `Use your @${UNIVERSITY_DOMAIN} email address.`),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type RegisterStaffFormValues = z.infer<typeof registerStaffSchema>
