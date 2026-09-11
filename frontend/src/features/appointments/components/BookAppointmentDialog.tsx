import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api-client'
import { useCreateAppointment } from '../hooks'

/** Mirrors CreateAppointmentRequestValidator on the server. */
const schema = z.object({
  scheduledDate: z.string()
    .min(1, 'Required')
    .refine((v) => v >= new Date().toISOString().slice(0, 10), 'Cannot be in the past'),
  scheduledTime: z.string().min(1, 'Required'),
  reason: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

export function BookAppointmentDialog({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false)
  const createAppointment = useCreateAppointment(studentId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(values: FormValues) {
    createAppointment.mutate(values, {
      onSuccess: () => {
        toast.success('Appointment requested')
        reset()
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Book appointment</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            A staff member will approve or decline this request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="scheduledDate">Date</Label>
              <Input id="scheduledDate" type="date" {...register('scheduledDate')} />
              {errors.scheduledDate && (
                <p className="text-xs text-destructive">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="scheduledTime">Time</Label>
              <Input id="scheduledTime" type="time" {...register('scheduledTime')} />
              {errors.scheduledTime && (
                <p className="text-xs text-destructive">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea id="reason" rows={3} placeholder="e.g. Recurring headaches"
              {...register('reason')} />
            {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? 'Booking…' : 'Book'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
