import { LockKeyhole } from "lucide-react"
import { Link } from "react-router-dom"
import { button } from "@/components/campus/ui"

// Rendered inside the application shell, whose <main> is the page landmark.
export default function AccessDenied() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--app-header-height))] items-center justify-center bg-canvas px-6 py-16">
      <section className="ink-blueprint w-full max-w-lg p-8 text-center sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-800 text-on-ink">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">Protected area</p>
        <h1 className="mt-2 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">This account does not have the SUPER_ADMIN or department-scoped administrative role required for this CampusNav page.</p>
        <Link to="/dashboard" className={`${button.secondary} mt-7`}>Return to Dashboard</Link>
      </section>
    </div>
  )
}
