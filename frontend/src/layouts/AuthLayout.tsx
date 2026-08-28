import { Outlet } from 'react-router-dom'

/** Centred shell for signed-out pages (login, forgot password). */
export function AuthLayout() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </main>
  )
}
