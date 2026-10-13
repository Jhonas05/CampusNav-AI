import { ChevronRight, UserRound } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import MobileBottomSheet from "./MobileBottomSheet"
import { getAccountIdentity, getAdminNavSection, isNavItemActive, MOBILE_MORE_ITEMS } from "./sidebar/navigation"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const row = "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-fill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink motion-reduce:transition-none"
const groupLabel = "px-3 pb-1.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint"

/**
 * The phone "More" sheet: the destinations that are not in the bottom
 * navigation, appearance, and the account. Each appears once.
 * @param {Record<string, any>} props
 */
export default function MoreSheet(props) {
  const { open, onOpenChange, onOpenProfile } = props
  const { pathname } = useLocation()
  const auth = useAuth()
  const developerMode = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MAP_VERIFICATION === "true"
  const adminItems = getAdminNavSection(auth, { developerMode })?.items || []
  const identity = getAccountIdentity(auth)
  const close = () => onOpenChange(false)

  return (
    <MobileBottomSheet open={open} onOpenChange={onOpenChange} title="More">
      <ul>
        {[...MOBILE_MORE_ITEMS, ...adminItems].map((item) => {
          const Icon = item.icon
          const active = isNavItemActive(pathname, item)
          const emergency = item.path === "/emergency"
          return (
            <li key={item.path}>
              <Link to={item.path} onClick={close} aria-current={active ? "page" : undefined} className={cn(row, active && "bg-fill-strong font-semibold")}>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", emergency ? "bg-ink text-on-ink" : "border border-line bg-surface text-ink-mid")}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-ghost" aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>

      <p className={groupLabel}>Appearance</p>
      <div className="px-3"><ThemeToggle className="[&>button]:min-h-11" /></div>

      <p className={groupLabel}>Account</p>
      <button type="button" onClick={() => { close(); onOpenProfile() }} aria-label={`Account, ${identity.name}, ${identity.role}`} className={row}>
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-fill text-[12px] font-semibold text-ink">
          {identity.initials || <UserRound className="h-[18px] w-[18px]" />}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate">{identity.name}</span>
          <span className="block truncate text-xs font-normal text-ink-soft">{identity.role}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-ghost" aria-hidden="true" />
      </button>
    </MobileBottomSheet>
  )
}
