import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/lib/api-client'
import { useAbandonVisit } from '../hooks'

export function AbandonVisitDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const abandon = useAbandonVisit()

  function onConfirm() {
    abandon.mutate(visitId, {
      onSuccess: () => {
        toast.success(`${studentName} marked as left without being seen`)
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Abandon</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark as left without being seen?</DialogTitle>
          <DialogDescription>
            {studentName} will be removed from the queue and the visit closed. This can't be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Keep in queue</Button>
          <Button type="button" variant="destructive" disabled={abandon.isPending} onClick={onConfirm}>
            {abandon.isPending ? 'Removing…' : 'Mark as left'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
