import { ROLES } from '@/config/roles'
import { useAuth } from '@/features/auth/auth-context'
import { RecordConsultationDialog } from '@/features/consultations/components/RecordConsultationDialog'
import { QueueBoard } from './QueueBoard'

export function DoctorQueuePage() {
  const { hasRole } = useAuth()
  const isDoctor = hasRole(ROLES.Doctor)

  return (
    <QueueBoard
      title={isDoctor ? 'My queue' : 'Doctor queue'}
      description={isDoctor
        ? 'Your checked-in patients, in order. Saving a consultation sends each one on.'
        : 'Every checked-in patient waiting on a doctor, across all doctors.'}
      stage="Doctor"
      // Recording a consultation is Doctor-only on the server — Admin gets a
      // read-only view here, same as Admin never practices medicine elsewhere
      // in this app.
      renderAction={(visit) => (
        isDoctor
          ? <RecordConsultationDialog visitId={visit.id} studentName={visit.studentName} />
          : null
      )}
    />
  )
}
