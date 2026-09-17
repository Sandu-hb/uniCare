/** Mirrors UniCare.Domain.Enums.VisitStatus. */
export type VisitStatus =
  | 'CheckedIn' | 'WithNurse' | 'AwaitingDoctor' | 'WithDoctor' | 'Completed' | 'Abandoned'

/** Mirrors UniCare.Domain.Enums.QueueStage. Pharmacy/Laboratory are reserved — unreachable until those features exist. */
export type QueueStage = 'Nurse' | 'Doctor' | 'Pharmacy' | 'Laboratory'

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  CheckedIn: 'Checked in',
  WithNurse: 'With nurse',
  AwaitingDoctor: 'Awaiting doctor',
  WithDoctor: 'With doctor',
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
  hasVitalSign: boolean
  hasConsultation: boolean
}

/** Mirrors CheckInRequest. */
export interface CheckInRequest {
  appointmentId?: string | null
  isEmergency?: boolean
}
