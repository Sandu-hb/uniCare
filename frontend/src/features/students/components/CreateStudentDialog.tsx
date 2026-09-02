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
import { getApiErrorMessage } from '@/lib/api-client'
import { useCreateStudent } from '../hooks'
import { GENDERS, type Gender } from '../types'

/**
 * Mirrors CreateStudentRequestValidator on the server. Client-side validation is
 * for fast feedback only — the server validates independently, because anyone can
 * bypass a browser.
 */
const schema = z.object({
    registrationNumber: z.string().min(1, 'Required').max(32)
        .regex(/^[A-Za-z0-9/-]+$/, 'Letters, digits, hyphens and slashes only'),
    fullName: z.string().min(1, 'Required').max(256),
    dateOfBirth: z.string().min(1, 'Required'),
    gender: z.enum(['Male', 'Female', 'Other']),
    faculty: z.string().min(1, 'Required'),
    department: z.string().min(1, 'Required'),
    academicYear: z.number().int().min(1, '1 to 6').max(6, '1 to 6'),
    email: z.email('Enter a valid email'),
    contactNumber: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function Field({
    id, label, error, children,
}: { id: string; label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}

export function CreateStudentDialog() {
    const [open, setOpen] = useState(false)
    const createStudent = useCreateStudent()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { gender: 'Male', academicYear: 1 },
    })

    function onSubmit(values: FormValues) {
        createStudent.mutate(values, {
            onSuccess: (student) => {
                toast.success(`${student.fullName} registered`)
                reset()
                setOpen(false)
            },
            // 409 from a duplicate registration number lands here.
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Register student</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Register student</DialogTitle>
                    <DialogDescription>
                        Create a student record. Medical registration happens separately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="registrationNumber" label="Registration number"
                            error={errors.registrationNumber?.message}>
                            <Input id="registrationNumber" placeholder="S12345"
                                {...register('registrationNumber')} />
                        </Field>

                        <Field id="fullName" label="Full name" error={errors.fullName?.message}>
                            <Input id="fullName" {...register('fullName')} />
                        </Field>

                        <Field id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth?.message}>
                            <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                        </Field>

                        <Field id="gender" label="Gender" error={errors.gender?.message}>
                            <select
                                id="gender"
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                {...register('gender')}
                            >
                                {GENDERS.map((g: Gender) => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </Field>

                        <Field id="faculty" label="Faculty" error={errors.faculty?.message}>
                            <Input id="faculty" {...register('faculty')} />
                        </Field>

                        <Field id="department" label="Department" error={errors.department?.message}>
                            <Input id="department" {...register('department')} />
                        </Field>

                        <Field id="academicYear" label="Academic year" error={errors.academicYear?.message}>
                            <Input id="academicYear" type="number" min={1} max={6}
                                {...register('academicYear', { valueAsNumber: true })} />
                        </Field>

                        <Field id="email" label="Email" error={errors.email?.message}>
                            <Input id="email" type="email" {...register('email')} />
                        </Field>

                        <Field id="contactNumber" label="Contact number">
                            <Input id="contactNumber" {...register('contactNumber')} />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createStudent.isPending}>
                            {createStudent.isPending ? 'Saving…' : 'Register'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
