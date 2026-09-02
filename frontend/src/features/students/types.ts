/** Mirrors UniCare.Domain.Enums.Gender, serialized as text by the API. */
export type Gender = 'Unspecified' | 'Male' | 'Female' | 'Other'

export const GENDERS: Gender[] = ['Male', 'Female', 'Other']

/** Mirrors StudentDto. */
export interface Student {
  id: string
  registrationNumber: string
  fullName: string
  dateOfBirth: string        // DateOnly serializes as "2004-09-11"
  gender: Gender
  faculty: string
  department: string
  academicYear: number
  contactNumber: string | null
  email: string
  address: string | null
  emergencyContactName: string | null
  emergencyContactNumber: string | null
}

/** Mirrors CreateStudentRequest. */
export interface CreateStudentRequest {
  registrationNumber: string
  fullName: string
  dateOfBirth: string
  gender: Gender
  faculty: string
  department: string
  academicYear: number
  contactNumber?: string | null
  email: string
  address?: string | null
  emergencyContactName?: string | null
  emergencyContactNumber?: string | null
}
