import { ArrowRight, Building2, CalendarDays, CornerDownLeft, DoorOpen, LayoutGrid, MessageCircle, Navigation, Search, ShieldAlert, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { facilities } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { getDashboardSnapshot } from "@/services/dashboardService"
import { cn } from "@/lib/utils"

const normalize = (value) => value.trim().toLowerCase()

const matchesQuery = (facility, needle) => {
  const floor = getFloorById(facility.floorId)
  return [facility.name, facility.kind, facility.floorId, floor?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle)
}

const FEATURED_IDS = ["registrar-office", "library", "guidance-office", "computer-laboratory", "osas"]

const QUICK_LINKS = [
  { id: "action-navigate", label: "Open Navigate", detail: "Indoor navigation, GF–5F", href: "/map", icon: Navigation },
  { id: "action-dashboard", label: "View Dashboard", detail: "Campus information hub", href: "/dashboard", icon: LayoutGrid },
  { id: "action-events", label: "Browse Events", detail: "Today, upcoming, calendar", href: "/events", icon: CalendarDays },
  { id: "action-emergency", label: "Emergency Information", detail: "Verified safety guidance", href: "/emergency", icon: ShieldAlert },
]

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const events = useMemo(() => {
    if (!open) return []
    const snapshot = getDashboardSnapshot({ now: new Date() })
    return [...snapshot.events.today, ...snapshot.events.upcoming]
  }, [open])

  const groups = useMemo(() => {
    const needle = normalize(query)
    if (!needle) {
      return [
        { title: "Quick access", items: QUICK_LINKS.map((link) => ({ ...link, type: "action" })) },
        {
          title: "Facilities",
          items: FEATURED_IDS
            .map((id) => facilities.find((facility) => facility.id === id))
            .filter(Boolean)
            .map((facility) => ({ type: "facility", facility, id: `facility-${facility.id}` })),
        },
      ]
    }

    const matched = facilities.filter((facility) => facility.kind !== "Construction" && matchesQuery(facility, needle))
    const facilityItems = matched.filter((facility) => facility.kind !== "Room").slice(0, 6)
    const roomItems = matched.filter((facility) => facility.kind === "Room").slice(0, 4)
    const eventItems = events.filter((event) => `${event.title} ${event.location || ""}`.toLowerCase().includes(needle)).slice(0, 3)

    const result = []
    if (facilityItems.length) result.push({ title: "Facilities", items: facilityItems.map((facility) => ({ type: "facility", facility, id: `facility-${facility.id}` })) })
    if (roomItems.length) result.push({ title: "Rooms", items: roomItems.map((facility) => ({ type: "facility", facility, id: `facility-${facility.id}` })) })
    if (eventItems.length) result.push({ title: "Events", items: eventItems.map((event) => ({ type: "event", event, id: `event-${event.id}` })) })
    result.push({
      title: "Assistance",
      items: [{ type: "action", id: "action-clara", label: `Ask CLARA about “${query.trim()}”`, detail: "Campus digital concierge", href: `/clara?q=${encodeURIComponent(query.trim())}`, icon: MessageCircle }],
    })
    return result
  }, [events, query])

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups])

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
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const activeElement = listRef.current?.querySelector('[data-active="true"]')
    activeElement?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  if (!open) return null

  const openItem = (item) => {
    if (!item) return
    onClose()
    if (item.type === "facility") navigate(`/facilities/${item.facility.id}`)
    else if (item.type === "event") navigate("/events")
    else navigate(item.href)
  }

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, flatItems.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      openItem(flatItems[activeIndex])
    }
  }

  let itemOffset = 0

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#1D1D1F]/40 px-4 pb-10 pt-[9vh] backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" aria-label="Search CampusNav" onKeyDown={onKeyDown} className="ink-blueprint mx-auto w-full max-w-xl overflow-hidden shadow-[0_18px_42px_rgba(29,31,32,0.16)]">
        <div className="flex items-center gap-3 border-b border-[#E5E5E7] px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-[#86868B]" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search facilities, rooms, services, events..."
            aria-label="Search facilities, rooms, services, and events"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1D1D1F] outline-none placeholder:text-[#86868B]"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="flex h-8 w-8 items-center justify-center rounded-full text-[#6E6E73] transition-colors hover:bg-[#F5F5F7] hover:text-[#1D1D1F]">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain p-2.5">
          {flatItems.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-[#1D1D1F]">No matches in the verified directory</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6E6E73]">Try an office, laboratory, room number, or floor.</p>
            </div>
          ) : (
            groups.map((group) => {
              const startIndex = itemOffset
              itemOffset += group.items.length
              return (
                <div key={group.title} className="mb-1.5">
                  <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868B]">{group.title}</p>
                  <ul>
                    {group.items.map((item, index) => {
                      const flatIndex = startIndex + index
                      const active = flatIndex === activeIndex
                      const Icon = item.type === "facility" ? (item.facility.kind === "Room" ? DoorOpen : Building2) : item.type === "event" ? CalendarDays : item.icon
                      const label = item.type === "facility" ? item.facility.name : item.type === "event" ? item.event.title : item.label
                      const detail = item.type === "facility"
                        ? `${item.facility.kind} · ${getFloorById(item.facility.floorId)?.name || item.facility.floorId}`
                        : item.type === "event" ? (item.event.location || "Campus event") : item.detail
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            data-active={active || undefined}
                            onClick={() => openItem(item)}
                            onMouseMove={() => setActiveIndex(flatIndex)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
                              active ? "bg-brand-50" : "bg-transparent"
                            )}
                          >
                            <span className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent",
                              item.type === "facility"
                                ? getFacilityCategory(item.facility).tile
                                : active ? "bg-brand-700 text-white" : "border-[#E5E5E7] bg-white text-[#6E6E73]"
                            )}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-[#1D1D1F]">{label}</span>
                              <span className="block truncate text-xs text-[#86868B]">{detail}</span>
                            </span>
                            {item.type === "facility" && <span className="shrink-0 rounded-full border border-[#D2D2D7] bg-white px-2 py-0.5 text-[10px] font-bold text-[#6E6E73]">{item.facility.floorId}</span>}
                            {active ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" /> : <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#D2D2D7]" aria-hidden="true" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E5E7] bg-[#FAFAFA] px-5 py-3 text-[10px] font-medium text-[#86868B]">
          <span>↑↓ to browse · Enter to open · Esc to close</span>
          <span className="hidden sm:block">Verified floor assignments only</span>
        </div>
      </div>
    </div>
  )
}
