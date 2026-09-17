import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api-client'
import { useCompleteLabOrder, useLabOrder } from '../hooks'

export function CompleteLabOrderDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const [resultNotes, setResultNotes] = useState('')
  const { data: order } = useLabOrder(visitId, open)
  const complete = useCompleteLabOrder(visitId)

  function onSubmit() {
    complete.mutate({ resultNotes }, {
      onSuccess: () => {
        toast.success('Lab order completed')
        setOpen(false)
        setResultNotes('')
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Complete</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete lab order</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Requested</Label>
            <p className="rounded-md border border-border bg-muted/40 p-2 text-sm">
              {order?.requestDetails ?? 'Loading…'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="resultNotes">Result notes (optional)</Label>
            <Textarea id="resultNotes" rows={3} value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" disabled={complete.isPending} onClick={onSubmit}>
            {complete.isPending ? 'Saving…' : 'Mark completed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
