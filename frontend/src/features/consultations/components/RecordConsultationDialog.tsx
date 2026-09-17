import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { useMedicines } from '@/features/medicines/hooks'
import { getApiErrorMessage } from '@/lib/api-client'
import { useConsultation, useUpsertConsultation } from '../hooks'

/** Mirrors UpsertConsultationRequestValidator on the server. */
const schema = z.object({
  symptoms: z.string().max(2000).optional(),
  examinationFindings: z.string().max(2000).optional(),
  treatment: z.string().max(2000).optional(),
  followUpInstructions: z.string().max(2000).optional(),
  diagnoses: z.array(z.object({
    description: z.string().min(1, 'Required').max(256),
    icdCode: z.string().max(16).optional(),
    isPrimary: z.boolean(),
  })),
  prescriptionItems: z.array(z.object({
    medicineId: z.string().min(1),
    medicineName: z.string(),
    dosage: z.string().min(1, 'Required').max(100),
    frequency: z.string().min(1, 'Required').max(100),
    durationDays: z.number().int().min(0),
    quantity: z.number().int().min(1),
    instructions: z.string().max(500).optional(),
  })),
  labRequestDetails: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

function Field({ id, label, error, children }: {
  id: string; label: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function MedicinePicker({ onPick }: { onPick: (medicine: { id: string; name: string }) => void }) {
  const [search, setSearch] = useState('')
  const { data: medicines } = useMedicines(search)

  return (
    <div className="grid gap-1.5">
      <Input
        placeholder="Search medicine to add…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <div className="max-h-32 overflow-y-auto rounded-md border border-border">
          {medicines?.length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">No matching medicine.</p>
          )}
          {medicines?.map((m) => (
            <button
              key={m.id}
              type="button"
              className="block w-full px-2.5 py-1.5 text-left text-sm hover:bg-muted"
              onClick={() => { onPick({ id: m.id, name: m.name }); setSearch('') }}
            >
              {m.name}{m.strength ? ` (${m.strength})` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function RecordConsultationDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const { data: existing } = useConsultation(visitId, open)
  const upsert = useUpsertConsultation(visitId)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { diagnoses: [], prescriptionItems: [] },
  })

  const diagnosisFields = useFieldArray({ control, name: 'diagnoses' })
  const prescriptionFields = useFieldArray({ control, name: 'prescriptionItems' })

  useEffect(() => {
    if (existing) {
      reset({
        symptoms: existing.symptoms ?? '',
        examinationFindings: existing.examinationFindings ?? '',
        treatment: existing.treatment ?? '',
        followUpInstructions: existing.followUpInstructions ?? '',
        diagnoses: existing.diagnoses.map((d) => ({
          description: d.description,
          icdCode: d.icdCode ?? '',
          isPrimary: d.isPrimary,
        })),
        prescriptionItems: existing.prescriptionItems.map((i) => ({
          medicineId: i.medicineId,
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          durationDays: i.durationDays,
          quantity: i.quantity,
          instructions: i.instructions ?? '',
        })),
        labRequestDetails: existing.labRequestDetails ?? '',
      })
    }
  }, [existing, reset])

  function onSubmit(values: FormValues) {
    upsert.mutate(values, {
      onSuccess: () => {
        toast.success('Consultation recorded')
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Consultation</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record consultation</DialogTitle>
          <DialogDescription>
            {studentName} — saving sends this visit to the lab and/or pharmacy if either is needed, or completes it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <Field id="symptoms" label="Symptoms" error={errors.symptoms?.message}>
            <Textarea id="symptoms" rows={2} {...register('symptoms')} />
          </Field>

          <Field id="examinationFindings" label="Examination findings" error={errors.examinationFindings?.message}>
            <Textarea id="examinationFindings" rows={2} {...register('examinationFindings')} />
          </Field>

          <Field id="treatment" label="Treatment" error={errors.treatment?.message}>
            <Textarea id="treatment" rows={2} {...register('treatment')} />
          </Field>

          <Field id="followUpInstructions" label="Follow-up instructions" error={errors.followUpInstructions?.message}>
            <Textarea id="followUpInstructions" rows={2} {...register('followUpInstructions')} />
          </Field>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Diagnoses</Label>
              <Button type="button" size="sm" variant="outline"
                onClick={() => diagnosisFields.append({
                  description: '', icdCode: '', isPrimary: diagnosisFields.fields.length === 0,
                })}>
                <Plus className="size-3.5" /> Add
              </Button>
            </div>

            {diagnosisFields.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">No diagnoses recorded.</p>
            )}

            {diagnosisFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                <div className="grid flex-1 gap-2">
                  <Input placeholder="Diagnosis" {...register(`diagnoses.${index}.description`)} />
                  {errors.diagnoses?.[index]?.description && (
                    <p className="text-xs text-destructive">
                      {errors.diagnoses[index]?.description?.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <Input placeholder="ICD code (optional)" className="max-w-40"
                      {...register(`diagnoses.${index}.icdCode`)} />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" className="size-3.5 accent-primary"
                        {...register(`diagnoses.${index}.isPrimary`)} />
                      Primary
                    </label>
                  </div>
                </div>
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Remove diagnosis"
                  onClick={() => diagnosisFields.remove(index)}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label>Prescription</Label>
            <MedicinePicker onPick={(m) => prescriptionFields.append({
              medicineId: m.id, medicineName: m.name, dosage: '', frequency: '',
              durationDays: 1, quantity: 1, instructions: '',
            })} />

            {prescriptionFields.fields.length === 0 && (
              <p className="text-xs text-muted-foreground">No medicine prescribed.</p>
            )}

            {prescriptionFields.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                <div className="grid flex-1 gap-2">
                  <p className="text-sm font-medium">{field.medicineName}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Input placeholder="Dosage" {...register(`prescriptionItems.${index}.dosage`)} />
                    <Input placeholder="Frequency" {...register(`prescriptionItems.${index}.frequency`)} />
                    <Input type="number" min={0} placeholder="Days"
                      {...register(`prescriptionItems.${index}.durationDays`, { valueAsNumber: true })} />
                    <Input type="number" min={1} placeholder="Quantity"
                      {...register(`prescriptionItems.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <Input placeholder="Instructions (optional)"
                    {...register(`prescriptionItems.${index}.instructions`)} />
                  {(errors.prescriptionItems?.[index]?.dosage || errors.prescriptionItems?.[index]?.frequency) && (
                    <p className="text-xs text-destructive">Dosage and frequency are required.</p>
                  )}
                </div>
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Remove medicine"
                  onClick={() => prescriptionFields.remove(index)}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Field id="labRequestDetails" label="Lab request (optional)" error={errors.labRequestDetails?.message}>
            <Textarea id="labRequestDetails" rows={2} placeholder="e.g. CBC, blood glucose"
              {...register('labRequestDetails')} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save consultation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
