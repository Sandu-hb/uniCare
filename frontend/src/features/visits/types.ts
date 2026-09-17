/** Mirrors UniCare.Domain.Enums.VisitStatus. */
export type VisitStatus =
  | 'CheckedIn' | 'AwaitingLab' | 'AwaitingPharmacy' | 'Completed' | 'Abandoned'

/** Mirrors UniCare.Domain.Enums.QueueStage. */
export type QueueStage = 'Doctor' | 'Laboratory' | 'Pharmacy'

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  CheckedIn: 'Checked in',
  AwaitingLab: 'Awaiting lab',
  AwaitingPharmacy: 'Awaiting pharmacy',
  Completed: 'Completed',
  Abandoned: 'Left without being seen',
}

/** Mirrors VisitDto. */
export interface Visit {
  id: string
  studentId: string
  studentName: string
  appointmentId: string | null
  checkedInAt: string
  completedAt: string | null
  status: VisitStatus
  isEmergency: boolean
  queueNumber: number
  stage: QueueStage
  calledAt: string | null
  hasConsultation: boolean
}

/** Mirrors CheckInRequest. */
export interface CheckInRequest {
  appointmentId?: string | null
  isEmergency?: boolean
}
