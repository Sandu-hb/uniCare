import { Outlet } from 'react-router-dom'

/**
 * Shell for medical-center staff.
 * TODO(ui): add the sidebar, and show only the sections the signed-in role may
 * use — read it from useAuth().hasRole rather than hardcoding per page.
 */
export function StaffLayout() {
  return (
    <div className="flex min-h-svh bg-background">
      <aside className="w-56 shrink-0 border-r border-border p-4">
        <p className="text-sm font-semibold">UniCare</p>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
