import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { useUpsertVitalSign, useVitalSign } from '../hooks'

/** Mirrors UpsertVitalSignRequestValidator on the server. */
const schema = z.object({
  temperatureCelsius: z.number().min(30).max(45).nullable(),
  systolicBp: z.number().int().min(60).max(250).nullable(),
  diastolicBp: z.number().int().min(30).max(150).nullable(),
  pulseBpm: z.number().int().min(30).max(220).nullable(),
  heightCm: z.number().min(50).max(250).nullable(),
  weightKg: z.number().min(10).max(300).nullable(),
  observations: z.string().max(2000).optional(),
})

type FormValues = z.infer<typeof schema>

/** An empty number input yields NaN through valueAsNumber — store that as null. */
function orNull(value: number): number | null {
  return Number.isNaN(value) ? null : value
}

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

export function RecordVitalsDialog({ visitId, studentName }: { visitId: string; studentName: string }) {
  const [open, setOpen] = useState(false)
  const { data: existing } = useVitalSign(visitId, open)
  const upsert = useUpsertVitalSign(visitId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Upsert semantics: reopening to correct a reading should show what is there,
  // not a blank form.
  useEffect(() => {
    if (existing) {
      reset({
        temperatureCelsius: existing.temperatureCelsius,
        systolicBp: existing.systolicBp,
        diastolicBp: existing.diastolicBp,
        pulseBpm: existing.pulseBpm,
        heightCm: existing.heightCm,
        weightKg: existing.weightKg,
        observations: existing.observations ?? '',
      })
    }
  }, [existing, reset])

  function onSubmit(values: FormValues) {
    upsert.mutate(values, {
      onSuccess: () => {
        toast.success('Vitals recorded')
        setOpen(false)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Vitals</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record vitals</DialogTitle>
          <DialogDescription>{studentName} — leave anything you did not measure blank.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="temperatureCelsius" label="Temperature (°C)" error={errors.temperatureCelsius?.message}>
              <Input id="temperatureCelsius" type="number" step="0.1"
                {...register('temperatureCelsius', { setValueAs: orNull })} />
            </Field>

            <Field id="pulseBpm" label="Pulse (bpm)" error={errors.pulseBpm?.message}>
              <Input id="pulseBpm" type="number" {...register('pulseBpm', { setValueAs: orNull })} />
            </Field>

            <Field id="systolicBp" label="Systolic BP" error={errors.systolicBp?.message}>
              <Input id="systolicBp" type="number" {...register('systolicBp', { setValueAs: orNull })} />
            </Field>

            <Field id="diastolicBp" label="Diastolic BP" error={errors.diastolicBp?.message}>
              <Input id="diastolicBp" type="number" {...register('diastolicBp', { setValueAs: orNull })} />
            </Field>

            <Field id="heightCm" label="Height (cm)" error={errors.heightCm?.message}>
              <Input id="heightCm" type="number" step="0.1" {...register('heightCm', { setValueAs: orNull })} />
            </Field>

            <Field id="weightKg" label="Weight (kg)" error={errors.weightKg?.message}>
              <Input id="weightKg" type="number" step="0.1" {...register('weightKg', { setValueAs: orNull })} />
            </Field>
          </div>

          <Field id="observations" label="Observations" error={errors.observations?.message}>
            <Textarea id="observations" rows={3} placeholder="e.g. Feverish, mild sore throat"
              {...register('observations')} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving…' : 'Save vitals'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
