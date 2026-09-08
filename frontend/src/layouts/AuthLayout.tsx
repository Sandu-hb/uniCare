import { Outlet } from 'react-router-dom'

/** Full-bleed shell for signed-out pages (sign in, forgot password). */
export function AuthLayout() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-primary p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-24 size-72 rounded-full bg-white/10" />
        <div className="absolute top-1/3 -right-28 size-96 rounded-full bg-black/5" />
        <div className="absolute -bottom-32 left-1/4 size-72 rounded-full bg-white/10" />
      </div>
      <div className="relative w-full">
        <Outlet />
      </div>
    </main>
  )
}
