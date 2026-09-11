/** Mirrors UniCare.Domain.Enums.AppointmentStatus. */
export type AppointmentStatus =
  | 'Requested' | 'Approved' | 'Rejected' | 'Rescheduled' | 'CheckedIn' | 'Completed' | 'Cancelled'

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  Requested: 'Requested',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Rescheduled: 'Rescheduled',
  CheckedIn: 'Checked in',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

/** Statuses a student or staff member can still cancel from. */
export const OPEN_STATUSES: AppointmentStatus[] = ['Requested', 'Approved']

/** Mirrors AppointmentDto. */
export interface Appointment {
  id: string
  studentId: string
  studentName: string
  assignedStaffId: string | null
  assignedStaffName: string | null
  scheduledDate: string // DateOnly, "2026-09-20"
  scheduledTime: string // TimeOnly, "14:30:00"
  status: AppointmentStatus
  reason: string | null
  rejectionReason: string | null
}

/** Mirrors CreateAppointmentRequest. */
export interface CreateAppointmentRequest {
  scheduledDate: string
  scheduledTime: string
  reason?: string | null
}

/** Mirrors ApproveAppointmentRequest. */
export interface ApproveAppointmentRequest {
  assignedStaffId?: string | null
}

/** Mirrors AssignAppointmentStaffRequest. */
export interface AssignAppointmentStaffRequest {
  staffId: string
}

/**
 * Minimal shape for the assign-staff picker on the staff queue page — just
 * enough to render a dropdown. Mirrors the fields of StaffDto this page needs,
 * not the whole thing; there is no full Staff frontend feature yet.
 */
export interface AssignableStaff {
  id: string
  fullName: string
  role: string
}
