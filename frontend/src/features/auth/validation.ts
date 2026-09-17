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

/** Mirrors RegisterStudentRequestValidator on the server. */
export const registerStudentSchema = z
  .object({
    registrationNumber: z.string().min(1, 'Required').max(32)
      .regex(/^[A-Za-z0-9/-]+$/, 'Letters, digits, hyphens and slashes only'),
    fullName: z.string().min(1, 'Required').max(256),
    dateOfBirth: z.string().min(1, 'Required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    faculty: z.string().min(1, 'Required').max(256),
    department: z.string().min(1, 'Required').max(256),
    academicYear: z.number().int().min(1, '1 to 6').max(6, '1 to 6'),
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
  { value: 'PharmacyStaff', label: 'Pharmacist / Pharmacy Staff' },
  { value: 'LabStaff', label: 'Laboratory Technician / Lab Staff' },
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
