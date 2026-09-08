import { Outlet } from 'react-router-dom'

/** Full-bleed shell for signed-out pages (sign in, forgot password). */
export function AuthLayout() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-sidebar-accent-foreground p-4 sm:p-6 lg:p-8">
      {/* Ambient background lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-[500px] rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="flex w-full flex-1 items-center justify-center py-6">
        <Outlet />
      </div>
    </main>
  )
}
