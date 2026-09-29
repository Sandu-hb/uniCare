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
import { useCreateStaff } from '../hooks'
import { CREATABLE_STAFF_ROLES, SPECIALIZATIONS, type StaffRole } from '../types'

/**
 * Mirrors CreateStaffRequestValidator on the server. Client-side validation is
 * for fast feedback only — the server validates independently, because anyone can
 * bypass a browser. No password field: the server generates a temporary one and
 * emails it directly to the new staff member — it is never shown here.
 */
const schema = z.object({
    fullName: z.string().min(1, 'Required').max(256),
    email: z.email('Enter a valid email'),
    role: z.enum(['Doctor', 'Nurse']),
    specialization: z.enum(SPECIALIZATIONS).optional(),
    licenseNumber: z.string().max(256).optional(),
    contactNumber: z.string().max(32).optional(),
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

export function CreateStaffDialog() {
    const [open, setOpen] = useState(false)
    const createStaff = useCreateStaff()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { role: 'Doctor' },
    })

    function onSubmit(values: FormValues) {
        createStaff.mutate(values, {
            onSuccess: (staff) => {
                if (staff.welcomeEmailSent === false) {
                    toast.warning(
                        `${staff.fullName} added, but the welcome email with the temporary password `
                        + `could not be sent — share credentials with them another way.`)
                } else {
                    toast.success(`${staff.fullName} added. A temporary password was emailed to them.`)
                }
                reset()
                setOpen(false)
            },
            // 409 from a duplicate email lands here.
            onError: (error) => toast.error(getApiErrorMessage(error)),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add staff</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add staff</DialogTitle>
                    <DialogDescription>
                        Create a staff account directly. It is active immediately, and a temporary
                        password is emailed to them — no approval step.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="fullName" label="Full name" error={errors.fullName?.message}>
                            <Input id="fullName" {...register('fullName')} />
                        </Field>

                        <Field id="role" label="Role" error={errors.role?.message}>
                            <select
                                id="role"
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                {...register('role')}
                            >
                                {CREATABLE_STAFF_ROLES.map((r: StaffRole) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </Field>

                        <Field id="email" label="Email" error={errors.email?.message}>
                            <Input id="email" type="email" {...register('email')} />
                        </Field>

                        <Field id="specialization" label="Specialization" error={errors.specialization?.message}>
                            <select
                                id="specialization"
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                                defaultValue=""
                                {...register('specialization')}
                            >
                                <option value="" disabled>Select…</option>
                                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Field>

                        <Field id="licenseNumber" label="License number">
                            <Input id="licenseNumber" {...register('licenseNumber')} />
                        </Field>

                        <Field id="contactNumber" label="Contact number">
                            <Input id="contactNumber" {...register('contactNumber')} />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createStaff.isPending}>
                            {createStaff.isPending ? 'Saving…' : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
