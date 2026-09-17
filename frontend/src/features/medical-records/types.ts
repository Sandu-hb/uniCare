/** Mirrors VisitHistoryDiagnosisDto. */
export interface VisitHistoryDiagnosis {
  description: string
  icdCode: string | null
  isPrimary: boolean
}

/** Mirrors VisitHistoryPrescriptionItemDto. */
export interface VisitHistoryPrescriptionItem {
  medicineName: string
  dosage: string
  frequency: string
  durationDays: number
  quantity: number
  instructions: string | null
}

/** Mirrors VisitHistoryDto. */
export interface VisitHistory {
  id: string
  checkedInAt: string
  completedAt: string | null
  status: string

  doctorName: string | null
  symptoms: string | null
  examinationFindings: string | null
  treatment: string | null
  followUpInstructions: string | null
  diagnoses: VisitHistoryDiagnosis[]

  labRequestDetails: string | null
  labResultNotes: string | null
  labStatus: string | null

  prescriptionStatus: string | null
  prescriptionItems: VisitHistoryPrescriptionItem[]
}
