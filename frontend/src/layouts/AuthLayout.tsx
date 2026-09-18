import { Outlet } from 'react-router-dom'
import { AmbientGlow } from '@/components/common/AmbientGlow'

/** Full-bleed shell for signed-out pages (sign in, forgot password). */
export function AuthLayout() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-8">
      <AmbientGlow />

      <div className="flex w-full flex-1 items-center justify-center py-6">
        <Outlet />
      </div>
    </main>
  )
}
