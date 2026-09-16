/** Mirrors DiagnosisDto. */
export interface Diagnosis {
  id: string
  description: string
  icdCode: string | null
  isPrimary: boolean
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
}

/** Mirrors DiagnosisInput. */
export interface DiagnosisInput {
  description: string
  icdCode?: string | null
  isPrimary: boolean
}

/** Mirrors UpsertConsultationRequest — diagnoses are replaced wholesale. */
export interface UpsertConsultationRequest {
  symptoms?: string | null
  examinationFindings?: string | null
  treatment?: string | null
  followUpInstructions?: string | null
  diagnoses: DiagnosisInput[]
}
