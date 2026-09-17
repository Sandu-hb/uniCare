/** Mirrors MedicineDto. */
export interface Medicine {
  id: string
  name: string
  genericName: string | null
  form: string
  strength: string | null
  unit: string
}
