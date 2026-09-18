/**
 * Decorative blur-circle background lighting, extracted from AuthLayout so
 * other full-bleed pages (e.g. RegisterStudentPage) can reuse the same
 * palette-derived glow instead of hand-rolling their own off-palette blurs.
 */
export function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/2 -right-32 size-[500px] rounded-full bg-primary/15 blur-3xl" />
    </div>
  )
}
