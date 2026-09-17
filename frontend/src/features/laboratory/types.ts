/** Mirrors UniCare.Domain.Enums.LabOrderStatus. */
export type LabOrderStatus = 'Requested' | 'Completed'

/** Mirrors LabOrderDto. */
export interface LabOrder {
  id: string
  medicalVisitId: string
  studentId: string
  studentName: string
  requestDetails: string
  status: LabOrderStatus
  resultNotes: string | null
  requestedAt: string
  completedAt: string | null
}

/** Mirrors CompleteLabOrderRequest. */
export interface CompleteLabOrderRequest {
  resultNotes?: string | null
}
