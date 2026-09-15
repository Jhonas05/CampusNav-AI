import { LockKeyhole } from "lucide-react"
import { Link } from "react-router-dom"
import { button } from "@/components/campus/ui"

export default function AccessDenied() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F5F7] px-6 py-16">
      <section className="w-full max-w-lg rounded-[2rem] border border-[#E5E5E7] bg-white p-8 text-center sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D1D1F] text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#86868B]">Protected area</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6E6E73]">This account does not have the SUPER_ADMIN role required for the CampusNav Admin CMS.</p>
        <Link to="/dashboard" className={`${button.secondary} mt-7`}>Return to Dashboard</Link>
      </section>
    </main>
  )
}
