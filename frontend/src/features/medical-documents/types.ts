/** Mirrors UniCare.Domain.Enums.DocumentType. */
export type DocumentType = 'HospitalReport' | 'LabReport' | 'VaccinationRecord' | 'DentalReport' | 'Other'

export const DOCUMENT_TYPES: DocumentType[] = [
  'HospitalReport', 'LabReport', 'VaccinationRecord', 'DentalReport', 'Other',
]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  HospitalReport: 'Hospital report',
  LabReport: 'Lab report',
  VaccinationRecord: 'Vaccination record',
  DentalReport: 'Dental report',
  Other: 'Other',
}

/** Mirrors UniCare.Domain.Enums.DocumentStatus. */
export type DocumentStatus = 'Uploaded' | 'Processing' | 'Extracted' | 'Failed'

/** Mirrors MedicalDocumentDto. */
export interface MedicalDocument {
  id: string
  studentId: string
  originalFileName: string
  contentType: string
  sizeBytes: number
  documentType: DocumentType
  status: DocumentStatus
  uploadedAt: string
}

/** Matches the allow-list in MedicalDocumentService — kept in sync by hand. */
export const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
export const MAX_SIZE_BYTES = 10 * 1024 * 1024
