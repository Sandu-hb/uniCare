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
import { useStudents } from '@/features/students/hooks'
import { useAssignableStaff, useCreateAppointment } from '../hooks'

const MORNING_START = '08:00'
const MORNING_END = '12:30'
const AFTERNOON_START = '13:00'
const AFTERNOON_END = '17:00'

function isWithinBusinessHours(time: string): boolean {
  return (time >= MORNING_START && time <= MORNING_END) ||
    (time >= AFTERNOON_START && time <= AFTERNOON_END)
}

function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

/** "HH:mm", matching what the date input's `type="time"` would have produced. */
function currentTime(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

/** "YYYY-MM-DD" in local time — toISOString() would give the UTC date, which
 * can be a day off from what the clock on the wall (and the business-hours
 * check above, also local) actually says. */
function currentDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Mirrors CreateAppointmentRequestValidator on the server. */
const schema = z.object({
  studentId: z.string().min(1, 'Select a student'),
  assignedStaffId: z.string().min(1, 'Select a doctor'),
  reason: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')

  const { data: students } = useStudents({ search: studentSearch || undefined, pageSize: 20 })
  const { data: staff } = useAssignableStaff()
  const doctors = staff?.filter((s) => s.role === 'Doctor')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })
  // studentId isn't sent in the request body — it's the route param that
  // scopes which student's appointment list useCreateAppointment invalidates.
  const createAppointment = useCreateAppointment(watch('studentId') || '')

  // Booked for right now — there is no date/time picker. Evaluated on every
  // render (cheap) so the "closed right now" message stays accurate while
  // the dialog sits open across a business-hours boundary.
  const now = new Date()
  const canBookNow = isWeekday(now) && isWithinBusinessHours(currentTime(now))

  function onSubmit(values: FormValues) {
    const submittedAt = new Date()
    createAppointment.mutate(
      {
        assignedStaffId: values.assignedStaffId,
        scheduledDate: currentDate(submittedAt),
        scheduledTime: currentTime(submittedAt),
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.success('Appointment booked')
          reset()
          setOpen(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New appointment</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Booked for right now — {currentDate(now)} at {currentTime(now)}.
          </DialogDescription>
        </DialogHeader>

        {!canBookNow && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            The medical centre is closed right now — appointments can only be booked
            Monday–Friday, 8:00 AM–12:30 PM or 1:00 PM–5:00 PM.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="studentSearch">Student</Label>
            <Input
              id="studentSearch"
              placeholder="Search by name or registration number…"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              {...register('studentId')}
            >
              <option value="">— select a student —</option>
              {students?.items.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.registrationNumber})</option>
              ))}
            </select>
            {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="assignedStaffId">Doctor</Label>
            <select
              id="assignedStaffId"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              {...register('assignedStaffId')}
            >
              <option value="">— select —</option>
              {doctors?.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
              ))}
            </select>
            {errors.assignedStaffId && (
              <p className="text-xs text-destructive">{errors.assignedStaffId.message}</p>
            )}
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
            <Button type="submit" disabled={createAppointment.isPending || !canBookNow}>
              {createAppointment.isPending ? 'Booking…' : 'Book'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
