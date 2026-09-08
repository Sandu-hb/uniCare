import { Outlet } from 'react-router-dom'

/** Full-bleed shell for signed-out pages (sign in, forgot password). */
export function AuthLayout() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-sidebar-accent-foreground p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-[500px] rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="flex w-full flex-1 items-center justify-center py-6">
        <Outlet />
      </div>

      {/* Footer links with index.css muted colors */}
      <footer className="relative z-10 my-2 text-center text-xs font-medium tracking-wide text-secondary-foreground/70">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="#" className="hover:text-secondary-foreground transition-colors">
            Privacy Policy
          </a>
          <span>·</span>
          <a href="#" className="hover:text-secondary-foreground transition-colors">
            Medical Confidentiality
          </a>
          <span>·</span>
          <a href="#" className="hover:text-secondary-foreground transition-colors">
            Terms of Service
          </a>
          <span>·</span>
          <a href="#" className="hover:text-secondary-foreground transition-colors">
            IT Helpdesk
          </a>
          <span>·</span>
          <span>© {new Date().getFullYear()} University Medical Centre</span>
        </div>
      </footer>
    </main>
  )
}
