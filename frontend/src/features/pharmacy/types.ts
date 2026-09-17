/** Mirrors UniCare.Domain.Enums.PrescriptionStatus. */
export type PrescriptionStatus = 'Issued' | 'PartiallyDispensed' | 'Dispensed' | 'Cancelled'

/** Mirrors PharmacyPrescriptionItemDto. */
export interface PharmacyPrescriptionItem {
  medicineName: string
  dosage: string
  frequency: string
  durationDays: number
  quantity: number
  instructions: string | null
}

/** Mirrors PharmacyPrescriptionDto. */
export interface PharmacyPrescription {
  id: string
  medicalVisitId: string
  studentId: string
  studentName: string
  status: PrescriptionStatus
  issuedAt: string
  notes: string | null
  items: PharmacyPrescriptionItem[]
}
