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
