import { Construction, Ellipsis, ExternalLink, Flag, LocateFixed, MessageCircle, Navigation, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { button, focusRing, StatusBadge } from "@/components/campus/ui"
import { useClara } from "@/components/clara/ClaraContext"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

const VERIFICATION_LABEL = {
  VERIFIED: "Verified",
  SOURCE_ALIGNED: "Source-aligned",
  ESTIMATED: "Estimated",
  PENDING_VERIFICATION: "Pending verification",
}

const Fact = ({ label, value, note = null }) => (
  <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 border-t border-line py-1.5 first:border-t-0">
    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
    <dd className="text-[12px] font-medium leading-snug text-ink">
      {value}
      {note && <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">{note}</span>}
    </dd>
  </div>
)

/**
 * Contextual facility panel shared by the 2D and 3D maps. It shows only
 * values held by the canonical facility record; unknown institutional data
 * uses the canonical unavailable/pending wording. Actions call existing
 * Navigate behavior or existing routes.
 * @param {Record<string, any>} props
 */
export default function FacilitySheet(props) {
  const {
    facility,
    isCurrentLocation = false,
    isDestination = false,
    emergencyMode = false,
    hasUsableEntrance = false,
    canStartNavigation = false,
    routeActive = false,
    onNavigateHere,
    onStartNavigation,
    onSetLocation,
    onClose,
    onAskClara = null,
    className,
  } = props

  const { openClara } = useClara()
  const [moreOpen, setMoreOpen] = useState(false)
  const canSetLocation = hasUsableEntrance && !isCurrentLocation && facility.navigable !== false
  const askClara = () => (onAskClara ? onAskClara(facility.id) : openClara({ facilityId: facility.id }))

  // On phones this sheet occupies the lower map area, so the floating CLARA
  // button yields to it; the sheet carries its own "Ask CLARA" action.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.claraDock = "clear-mobile"
    return () => { delete root.dataset.claraDock }
  }, [])
  const floor = getFloorById(facility.floorId)
  const category = getFacilityCategory(facility)
  const Icon = category.icon
  const underConstruction = facility.status === "UNDER_CONSTRUCTION"
  const pending = facility.status === "PENDING_VERIFICATION"
  const advisory = underConstruction
    ? { title: "Under construction", message: "This area is marked under construction in the source plan and is not navigable." }
    : !hasUsableEntrance
      ? { title: "Entrance pending verification", message: "This facility is source-confirmed, but its usable entrance is pending verification, so indoor routing is not available yet." }
      : null

  // In priority order. Emergency Mode has no destination routing, so setting
  // the current location leads there.
  const actions = [
    !emergencyMode && hasUsableEntrance && !isDestination && { key: "navigate", label: "Navigate here", icon: Navigation, onClick: onNavigateHere, primary: true },
    !emergencyMode && isDestination && !routeActive && { key: "start", label: "Start Navigation", icon: Navigation, onClick: onStartNavigation, disabled: !canStartNavigation, primary: true },
    emergencyMode && canSetLocation && { key: "locate", label: "Set as my location", icon: LocateFixed, onClick: onSetLocation, primary: true },
    { key: "details", label: "Details", icon: ExternalLink, to: `/facilities/${facility.id}` },
    !emergencyMode && canSetLocation && { key: "locate", label: "Set as my location", icon: LocateFixed, onClick: onSetLocation },
    !emergencyMode && { key: "clara", label: "Ask CLARA", icon: MessageCircle, onClick: askClara },
  ].filter(Boolean)

  return (
    <section
      aria-labelledby={`facility-sheet-${facility.id}`}
      className={cn("map-overlay-surface pointer-events-auto flex max-h-full flex-col overflow-hidden", className)}
    >
      <div className="flex items-start gap-3 border-b border-line p-3.5">
        <span aria-hidden="true" className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", category.tile)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{category.label} · {floor?.shortName || facility.floorId}</p>
          <h2 id={`facility-sheet-${facility.id}`} className="mt-0.5 font-heading text-xl font-semibold leading-tight text-ink">{facility.name}</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(underConstruction || pending) && <StatusBadge status={facility.status} />}
            {isCurrentLocation && (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-md bg-ink px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-on-ink">
                <LocateFixed className="h-3 w-3" aria-hidden="true" /> Your location
              </span>
            )}
            {isDestination && !emergencyMode && (
              <span className="inline-flex min-h-6 items-center gap-1 rounded-md bg-brand-700 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-on-ink">
                <Flag className="h-3 w-3" aria-hidden="true" /> Destination
              </span>
            )}
          </div>
        </div>
        <button type="button" aria-label="Close facility details" onClick={onClose} className={cn("-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-fill", focusRing)}>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 overflow-y-auto px-3.5 py-2.5">
        <dl>
          <Fact label="Floor" value={floor?.name || facility.floorId} note={VERIFICATION_LABEL[facility.verification.floor]} />
          <Fact label="Hours" value={facility.operatingHours || "Operating hours unavailable."} note={VERIFICATION_LABEL[facility.verification.operatingHours]} />
        </dl>
        {/* Room number, map position, and accessibility are on the facility page (Details). */}
        {advisory && (
          <div className="mt-2 rounded-lg border border-line-strong bg-fill p-2.5">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink"><Construction className="h-3.5 w-3.5" aria-hidden="true" /> {advisory.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink/85">{advisory.message}</p>
          </div>
        )}
      </div>

      {/* At most two actions are visible; the rest open under More. */}
      <div className="flex flex-wrap gap-1.5 border-t border-line p-3">
        {actions.slice(0, VISIBLE_ACTIONS).map((action, index) => <SheetAction key={action.key} action={action} primary={index === 0 && action.primary} />)}
        {actions.length > VISIBLE_ACTIONS && (
          <button type="button" aria-expanded={moreOpen} aria-label={moreOpen ? "Fewer actions" : "More actions"} onClick={() => setMoreOpen((open) => !open)} className={cn(button.smallSecondary, "min-h-11 px-3")}>
            <Ellipsis className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {moreOpen && actions.slice(VISIBLE_ACTIONS).map((action) => <SheetAction key={action.key} action={action} />)}
      </div>
    </section>
  )
}

const VISIBLE_ACTIONS = 2

function SheetAction({ action, primary = false }) {
  const Icon = action.icon
  const className = cn(primary ? button.smallPrimary : button.smallSecondary, "min-h-11")
  const content = <><Icon className="h-3.5 w-3.5" aria-hidden="true" /> {action.label}</>
  return action.to
    ? <Link to={action.to} className={className}>{content}</Link>
    : <button type="button" onClick={action.onClick} disabled={action.disabled} className={className}>{content}</button>
}
