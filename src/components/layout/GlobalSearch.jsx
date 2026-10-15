import { ArrowRight, Building2, CalendarDays, CornerDownLeft, DoorOpen, LayoutGrid, MessageCircle, Navigation, Search, ShieldAlert, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useNavigate } from "react-router-dom"
import { facilities } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { getDashboardSnapshot, getFacilityNavigationHref } from "@/services/dashboardService"
import { normalizeDiscoveryQuery } from "@/services/facilityDiscovery"
import { getGlobalFacilityGroups } from "@/services/globalFacilitySearch"
import { useFacilityDiscovery } from "@/contexts/FacilityDiscoveryContext"
import { useConnectivity } from "@/contexts/ConnectivityContext"
import { useClara } from "@/components/clara/ClaraContext"
import useModalDialog from "@/components/campus/useModalDialog"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const FEATURED_IDS = ["registrar-office", "library", "guidance-office", "computer-laboratory", "osas"]
const QUICK_LINKS = [
  { id: "action-navigate", label: "Open Navigate", detail: "Indoor navigation, GF–5F", href: "/map", icon: Navigation },
  { id: "action-dashboard", label: "View Dashboard", detail: "Campus information hub", href: "/dashboard", icon: LayoutGrid },
  { id: "action-events", label: "Browse Events", detail: "Today, upcoming, calendar", href: "/events", icon: CalendarDays },
  { id: "action-emergency", label: "Emergency Information", detail: "Verified safety guidance", href: "/emergency", icon: ShieldAlert },
]

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const { openClara } = useClara()
  const connectivity = useConnectivity()
  const discoveryState = useFacilityDiscovery(open)
  const dialogRef = useModalDialog({ active: open, onClose })
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const id = useId()
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewport, setViewport] = useState(null)

  const events = useMemo(() => {
    if (!open) return []
    const snapshot = getDashboardSnapshot({ now: new Date() })
    return [...snapshot.events.today, ...snapshot.events.upcoming]
  }, [open])
  const matched = useMemo(() => getGlobalFacilityGroups(query, { discoveryIndex: discoveryState.discoveryIndex }), [query, discoveryState.discoveryIndex])
  const groups = useMemo(() => {
    const needle = normalizeDiscoveryQuery(query)
    if (!needle) return [
      { title: "Quick access", items: QUICK_LINKS.map((link) => ({ ...link, type: "action" })) },
      { title: "Facilities", items: FEATURED_IDS.map((facilityId) => facilities.find(({ id: facilityIdInData }) => facilityIdInData === facilityId))
        .filter(Boolean).map((facility) => ({ type: "facility", facility, matches: [], id: `facility-${facility.id}` })) },
      { title: "Services", items: [] },
    ]
    const eventItems = events.filter((event) => normalizeDiscoveryQuery(`${event.title} ${event.location || ""}`).includes(needle)).slice(0, 3)
    return [
      ...matched.groups,
      { title: "Events", items: eventItems.map((event) => ({ type: "event", event, id: `event-${event.id}` })) },
      { title: "Assistance", items: [{ type: "clara", id: "action-clara", label: `Ask CLARA about “${query.trim()}”`, detail: "Campus digital concierge", question: query.trim(), icon: MessageCircle }] },
    ]
  }, [events, query, matched])
  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups])
  const safeIndex = Math.max(0, Math.min(activeIndex, flatItems.length - 1))
  const resultCount = flatItems.filter(({ type }) => type === "facility" || type === "event").length

  useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])
  useEffect(() => setActiveIndex(0), [query])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const updateViewport = () => setViewport({ height: window.visualViewport?.height || window.innerHeight, top: window.visualViewport?.offsetTop || 0 })
    updateViewport()
    window.visualViewport?.addEventListener("resize", updateViewport)
    window.visualViewport?.addEventListener("scroll", updateViewport)
    window.addEventListener("resize", updateViewport)
    return () => {
      document.body.style.overflow = previousOverflow
      window.visualViewport?.removeEventListener("resize", updateViewport)
      window.visualViewport?.removeEventListener("scroll", updateViewport)
      window.removeEventListener("resize", updateViewport)
    }
  }, [open])
  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [safeIndex, open, flatItems])

  if (!open) return null

  const openItem = (item) => {
    if (!item) return
    onClose()
    if (item.type === "facility") navigate(`/facilities/${encodeURIComponent(item.facility.id)}`)
    else if (item.type === "event") navigate("/events")
    else if (item.type === "clara") openClara({ question: item.question })
    else navigate(item.href)
  }
  // Only the input owns Arrow/Enter shortcuts. Tab-focused actions retain native behavior.
  const onInputKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex(Math.max(0, Math.min(safeIndex + (event.key === "ArrowDown" ? 1 : -1), flatItems.length - 1)))
    } else if (event.key === "Enter") {
      event.preventDefault()
      openItem(flatItems[safeIndex])
    }
  }
  let itemOffset = 0
  const activeItem = flatItems[safeIndex]
  const servicesAvailable = connectivity.isOnline && !discoveryState.loading && discoveryState.result?.ok
  const contents = (
    <div className="fixed inset-0 z-modal flex justify-center overflow-hidden bg-black/30 px-3 pb-[calc(var(--app-bottom-nav-height)+env(safe-area-inset-bottom,0px)+1rem)] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm sm:pt-[9vh]"
      style={viewport ? { height: viewport.height, top: viewport.top, bottom: "auto" } : undefined}
      role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search CampusNav" data-global-search-dialog=""
        className="ink-blueprint flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-3 sm:px-5">
          <Search className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onInputKeyDown} maxLength={200}
            placeholder="Search facilities, rooms, services, events..." aria-label="Search facilities, rooms, services, and events"
            aria-describedby={`${id}-help ${id}-count`} aria-controls={`${id}-results`}
            className={cn("min-h-11 min-w-0 flex-1 rounded-lg bg-transparent px-1 text-base text-ink placeholder:text-ink-faint sm:text-[15px]", focusRing)} />
          <button type="button" onClick={onClose} aria-label="Close search" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-fill hover:text-ink", focusRing)}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p id={`${id}-help`} className="sr-only">Search canonical facilities, service names, or exact approved service aliases. Choose a location; no route starts automatically.</p>
        <p id={`${id}-count`} className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {query.trim() ? `${resultCount} results. ` : "Quick access. "}{activeItem?.facility?.name || activeItem?.event?.title || activeItem?.label || "No active result"}
        </p>
        <div ref={listRef} id={`${id}-results`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5">
          {query.trim() && resultCount === 0 && <p className="px-3 py-3 text-sm text-ink-soft">No verified result. Try a facility, service name, or exact approved alias.</p>}
          {groups.map((group) => {
            const startIndex = itemOffset
            itemOffset += group.items.length
            if (!group.items.length && group.title !== "Services") return null
            return (
              <section key={group.title} aria-label={group.title} data-search-domain={group.title} className="mb-1.5">
                <h2 className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">{group.title}</h2>
                {group.title === "Services" && <div className="px-3 pb-2 text-xs leading-relaxed text-ink-soft">
                  {!connectivity.isOnline ? <p>Service search requires a connection. Canonical facility search remains available.</p>
                    : discoveryState.loading ? <p>Loading public service search…</p>
                      : !servicesAvailable ? <>
                        <p>Service search is temporarily unavailable. Canonical facility search remains available.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="button" onClick={discoveryState.retry} className={cn("min-h-11 rounded-lg border border-line-strong px-3 font-medium text-ink", focusRing)}>Retry service search</button>
                          <button type="button" onClick={() => window.location.reload()} className={cn("min-h-11 rounded-lg px-3 font-medium text-ink", focusRing)}>Reload page</button>
                        </div>
                      </> : <>
                        {discoveryState.result.data.services.length === 0 ? <p>No configured service locations are available yet.</p>
                          : !query.trim() ? <p>Search a service name or exact approved alias to see its configured locations.</p>
                            : matched.matchedServices.length === 0 ? <p>No verified service matches.</p> : null}
                        {query.trim() && matched.overlapCount > 0 && <p>Service matches also appear with their canonical facilities above.</p>}
                        {query.trim() && matched.unmappedServices.map((name) => <p key={name}>No configured location for {name}. No destination is inferred.</p>)}
                        {discoveryState.result.data.notices.pending && <p>Some service information is pending verification and is excluded.</p>}
                        {discoveryState.result.data.notices.demoExcluded && <p>Demo-only service information is excluded.</p>}
                      </>}
                </div>}
                <ul>
                  {group.items.map((item, index) => {
                    const flatIndex = startIndex + index
                    const active = flatIndex === safeIndex
                    const isFacility = item.type === "facility"
                    const Icon = isFacility ? (item.facility.kind === "Room" ? DoorOpen : Building2) : item.type === "event" ? CalendarDays : item.icon
                    const label = isFacility ? item.facility.name : item.type === "event" ? item.event.title : item.label
                    const detail = isFacility ? `${item.facility.kind} · ${getFloorById(item.facility.floorId)?.name || item.facility.floorId}` : item.type === "event" ? (item.event.location || "Campus event") : item.detail
                    const href = isFacility ? getFacilityNavigationHref(item.facility.id) : null
                    const Row = isFacility ? Link : "button"
                    return (
                      <li key={item.id} data-facility-id={item.facility?.id} className="flex items-center gap-1 rounded-xl">
                        <Row type={isFacility ? undefined : "button"} to={isFacility ? `/facilities/${encodeURIComponent(item.facility.id)}` : undefined}
                          data-active={active || undefined} onClick={() => isFacility ? onClose() : openItem(item)} onMouseMove={() => setActiveIndex(flatIndex)}
                          aria-label={isFacility ? `View details for ${label}` : undefined}
                          aria-describedby={item.matches?.length ? `${id}-match-${flatIndex}` : undefined}
                          className={cn("flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 motion-reduce:transition-none", active ? "bg-fill-strong" : "bg-transparent", focusRing)}>
                          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", isFacility ? getFacilityCategory(item.facility).tile : "border border-line bg-surface text-ink-soft")}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block break-words text-sm font-medium text-ink">{label}</span>
                            <span className="block break-words text-xs text-ink-faint">{detail}</span>
                            {item.matches?.length > 0 && <span id={`${id}-match-${flatIndex}`} className="mt-1 block break-words text-xs text-ink-soft">
                              Matches service: {item.matches[0].serviceName}{item.matches[0].alias && <> (approved alias: {item.matches[0].alias})</>}
                              {item.matches.length > 1 && <> · +{item.matches.length - 1} service matches</>}
                            </span>}
                          </span>
                          {active ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-mid" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-ghost" aria-hidden="true" />}
                        </Row>
                        {href && <Link to={href} state={{ facilityDestinationRequest: item.facility.id }} onClick={onClose} aria-label={`Navigate to ${label}`} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft hover:bg-fill", focusRing)}>
                          <Navigation className="h-4 w-4" aria-hidden="true" />
                        </Link>}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
        <div className="shrink-0 border-t border-line bg-subtle px-5 py-3 text-[10px] font-medium text-ink-faint">↑↓ to browse · Enter for details · Tab for actions · Esc to close</div>
      </div>
    </div>
  )
  // Native fullscreen only exposes descendants of its host. Keep the same modal/state.
  return typeof document === "undefined" ? contents : createPortal(contents, document.fullscreenElement || document.querySelector("[data-shell]") || document.body)
}
