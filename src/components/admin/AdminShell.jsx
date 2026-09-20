import { ShieldCheck } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const ADMIN_ROLE_CODES = ["SUPER_ADMIN", "DEPARTMENT_ADMIN"]

/**
 * Content wrapper for the admin CMS.
 *
 * Admin navigation now lives in the application sidebar's ADMINISTRATION
 * section (see `components/layout/navigationConfig.js`), which is filtered by
 * the same role requirements the routes enforce. This shell therefore keeps
 * only the page frame and the signed-in administrator context, so admin pages
 * are not wrapped in a second, duplicate navigation rail.
 */
export default function AdminShell({ children }) {
  const auth = useAuth()
  const roleCodes = auth.roles
    ?.map((role) => (typeof role === "string" ? role : role?.code))
    .filter((code) => ADMIN_ROLE_CODES.includes(code)) || []

  return (
    <div className="app-page bg-[#F5F5F7]">
      <div className="app-container">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D2D2D7] bg-white px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D1D1F] text-white">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </span>
            <div>
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-[#6E6E73]">CampusNav Administration</p>
              <p className="truncate text-sm font-semibold text-[#1D1D1F]">
                {auth.profile?.display_name || "CampusNav Administrator"}
              </p>
            </div>
          </div>
          <p className="rounded-full border border-[#1D1D1F] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#1D1D1F]">
            {roleCodes.join(" · ") || "ADMIN"}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
