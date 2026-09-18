/** Mirrors CounselingMessageRole. */
export type CounselingMessageRole = 'Student' | 'Assistant'

/** Mirrors CounselingSessionStatus. */
export type CounselingSessionStatus = 'Active' | 'Ended'

/** Mirrors CounselingMessageDto. */
export interface CounselingMessage {
  id: string
  role: CounselingMessageRole
  content: string
  sentAt: string
}

/** Mirrors CounselingSessionSummaryDto. */
export interface CounselingSessionSummary {
  id: string
  studentId: string
  studentName: string
  startedAt: string
  lastMessageAt: string
  status: CounselingSessionStatus
  crisisFlagged: boolean
}

/** Mirrors CounselingSessionDto. */
export interface CounselingSession extends CounselingSessionSummary {
  messages: CounselingMessage[]
}
