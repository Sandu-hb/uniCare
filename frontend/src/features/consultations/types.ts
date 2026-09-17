/** Mirrors DiagnosisDto. */
export interface Diagnosis {
  id: string
  description: string
  icdCode: string | null
  isPrimary: boolean
}

/** Mirrors PrescriptionItemDto. */
export interface PrescriptionItem {
  medicineId: string
  medicineName: string
  dosage: string
  frequency: string
  durationDays: number
  quantity: number
  instructions: string | null
}

/** Mirrors ConsultationDto. */
export interface Consultation {
  id: string
  medicalVisitId: string
  doctorStaffId: string
  doctorStaffName: string
  symptoms: string | null
  examinationFindings: string | null
  treatment: string | null
  followUpInstructions: string | null
  consultedAt: string
  diagnoses: Diagnosis[]
  prescriptionItems: PrescriptionItem[]
  labRequestDetails: string | null
}

/** Mirrors DiagnosisInput. */
export interface DiagnosisInput {
  description: string
  icdCode?: string | null
  isPrimary: boolean
}

/** Mirrors PrescriptionItemInput. */
export interface PrescriptionItemInput {
  medicineId: string
  dosage: string
  frequency: string
  durationDays: number
  quantity: number
  instructions?: string | null
}

/**
 * Mirrors UpsertConsultationRequest — diagnoses and prescriptionItems are
 * replaced wholesale. An empty prescriptionItems means no prescription; an
 * empty/absent labRequestDetails means no lab order — saving this is what
 * routes the visit onward to Laboratory and/or Pharmacy, or completes it.
 */
export interface UpsertConsultationRequest {
  symptoms?: string | null
  examinationFindings?: string | null
  treatment?: string | null
  followUpInstructions?: string | null
  diagnoses: DiagnosisInput[]
  prescriptionItems: PrescriptionItemInput[]
  labRequestDetails?: string | null
}
