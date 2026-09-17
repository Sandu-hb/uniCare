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

function isWeekday(date: string): boolean {
  const day = new Date(`${date}T00:00:00`).getDay()
  return day !== 0 && day !== 6
}

/** Mirrors CreateAppointmentRequestValidator on the server. */
const schema = z.object({
  studentId: z.string().min(1, 'Select a student'),
  assignedStaffId: z.string().min(1, 'Select a doctor'),
  scheduledDate: z.string()
    .min(1, 'Required')
    .refine((v) => v >= new Date().toISOString().slice(0, 10), 'Cannot be in the past')
    .refine(isWeekday, 'The medical centre is closed on weekends'),
  scheduledTime: z.string()
    .min(1, 'Required')
    .refine(isWithinBusinessHours, 'Must be between 8:00 AM–12:30 PM or 1:00 PM–5:00 PM'),
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

  function onSubmit(values: FormValues) {
    createAppointment.mutate(
      {
        assignedStaffId: values.assignedStaffId,
        scheduledDate: values.scheduledDate,
        scheduledTime: values.scheduledTime,
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
            Assign a doctor and a slot within business hours.
          </DialogDescription>
        </DialogHeader>

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
