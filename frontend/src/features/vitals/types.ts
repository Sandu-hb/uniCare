/** Mirrors VitalSignDto. */
export interface VitalSign {
  id: string
  medicalVisitId: string
  recordedByStaffId: string
  recordedByStaffName: string
  temperatureCelsius: number | null
  systolicBp: number | null
  diastolicBp: number | null
  pulseBpm: number | null
  heightCm: number | null
  weightKg: number | null
  observations: string | null
  recordedAt: string
}

/** Mirrors UpsertVitalSignRequest — every reading is optional. */
export interface UpsertVitalSignRequest {
  temperatureCelsius?: number | null
  systolicBp?: number | null
  diastolicBp?: number | null
  pulseBpm?: number | null
  heightCm?: number | null
  weightKg?: number | null
  observations?: string | null
}
