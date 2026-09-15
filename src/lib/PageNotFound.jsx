import { ArrowLeft, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

export default function PageNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6 py-24">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#E5E5E7] bg-white p-10 text-center sm:p-14">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5E5E7] bg-[#FAFAFA]">
          <MapPin className="h-5 w-5 text-[#86868B]" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#6E6E73]">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#1D1D1F]">Page not found</h1>
        <p className="mt-4 text-[#6E6E73]">The page you requested is not part of this campus guide.</p>
        <Link to="/" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1D1D1F] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F] focus-visible:ring-offset-2">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
        </Link>
      </div>
    </main>
  )
}
