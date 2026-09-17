import { RecordConsultationDialog } from '@/features/consultations/components/RecordConsultationDialog'
import { QueueBoard } from './QueueBoard'

export function DoctorQueuePage() {
  return (
    <QueueBoard
      title="My queue"
      description="Your checked-in patients, in order. Saving a consultation sends each one on."
      stage="Doctor"
      renderAction={(visit) => (
        <RecordConsultationDialog visitId={visit.id} studentName={visit.studentName} />
      )}
    />
  )
}
