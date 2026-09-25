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
import { useRejectMedicalProfile } from '../hooks'

export function RequestChangesDialog({ studentId, disabled }: { studentId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const reject = useRejectMedicalProfile(studentId)
  const trimmed = reason.trim()

  function onSubmit() {
    if (!trimmed) return
    reject.mutate({ reason: trimmed }, {
      onSuccess: () => {
        toast.success('Changes requested')
        setOpen(false)
        setReason('')
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>Request changes</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>
            The student will see this note on their medical profile and can resubmit after fixing it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          <Label htmlFor="rejectionReason">What needs to change?</Label>
          <Textarea
            id="rejectionReason"
            rows={4}
            autoFocus
            placeholder="e.g. The uploaded medical report is unreadable — please upload a clearer scan."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" disabled={!trimmed || reject.isPending} onClick={onSubmit}>
            {reject.isPending ? 'Sending…' : 'Send to student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
