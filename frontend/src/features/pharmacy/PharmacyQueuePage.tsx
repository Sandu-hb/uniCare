import { QueueBoard } from '@/features/visits/QueueBoard'
import { DispensePrescriptionDialog } from './components/DispensePrescriptionDialog'

export function PharmacyQueuePage() {
  return (
    <QueueBoard
      title="Pharmacy queue"
      description="Students with medicine to collect. Dispensing completes the visit."
      stage="Pharmacy"
      renderAction={(visit) => (
        <DispensePrescriptionDialog visitId={visit.id} studentName={visit.studentName} />
      )}
    />
  )
}
