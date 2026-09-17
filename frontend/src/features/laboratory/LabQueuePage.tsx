import { QueueBoard } from '@/features/visits/QueueBoard'
import { CompleteLabOrderDialog } from './components/CompleteLabOrderDialog'

export function LabQueuePage() {
  return (
    <QueueBoard
      title="Laboratory queue"
      description="Students sent for a lab test. Completing an order sends them on to pharmacy if prescribed, or finishes the visit."
      stage="Laboratory"
      renderAction={(visit) => (
        <CompleteLabOrderDialog visitId={visit.id} studentName={visit.studentName} />
      )}
    />
  )
}
