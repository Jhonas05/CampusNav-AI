import { Check, Search, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { focusRing } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"
import { useFacilityDiscovery } from "@/contexts/FacilityDiscoveryContext"
import { useConnectivity } from "@/contexts/ConnectivityContext"
import { getDestinationFacilityGroups } from "@/services/destinationFacilitySearch"

/**
 * Destination combobox for Navigate and Home. Typing an exact facility name
 * still resolves through the page's existing query handler; choosing an
 * option also asks the page to focus that facility on the map. `prominent`
 * is the Home presentation: a larger field under a plain-language question.
 * `labelClassName` lets a page hide the visible label where the placeholder
 * already asks the question (the label stays available to screen readers).
 * @param {Record<string, any>} props
 */
export default function DestinationSearch(props) {
  const { facilities, query, destinationId = "", onQueryChange, onSelect, label = "Search destination", placeholder = "Search rooms, offices, services…", prominent = false, labelClassName, className } = props
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [popupHeight, setPopupHeight] = useState(320)
  const connectivity = useConnectivity()
  const discovery = useFacilityDiscovery(open)
  const optionId = (index) => `${listId}-option-${index}`
  const composed = useMemo(() => getDestinationFacilityGroups(query, { facilities, destinationId, discoveryIndex: discovery.discoveryIndex }), [query, facilities, destinationId, discovery.discoveryIndex])
  const results = composed.groups.flatMap(({ items }) => items)
  const safeIndex = Math.max(0, Math.min(activeIndex, results.length - 1))
  const showList = open

  useEffect(() => {
    if (!showList) return
    document.getElementById(optionId(safeIndex))?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [safeIndex, showList, query, discovery.discoveryIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const resize = () => {
      const viewportBottom = (window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || window.innerHeight)
      const inputBox = rootRef.current.getBoundingClientRect()
      let bottom = viewportBottom - 16
      // Respect the actual chrome positions, including safe areas and route-sheet lift.
      document.querySelectorAll('[data-app-chrome="mobile-bottom-nav"], .clara-floating-button, #clara-chat-panel').forEach((element) => {
        const box = element.getBoundingClientRect()
        if (box.width && box.height && box.right > inputBox.left && box.left < inputBox.right) bottom = Math.min(bottom, box.top - 8)
      })
      setPopupHeight(Math.max(44, Math.min(320, bottom - inputBox.bottom - 4)))
    }
    resize()
    window.visualViewport?.addEventListener("resize", resize)
    window.visualViewport?.addEventListener("scroll", resize)
    window.addEventListener("resize", resize)
    window.addEventListener("scroll", resize, true)
    return () => {
      window.visualViewport?.removeEventListener("resize", resize)
      window.visualViewport?.removeEventListener("scroll", resize)
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", resize, true)
    }
  }, [open])

  const choose = (facility) => {
    // Only a displayed, canonical navigable choice may cross the selection boundary.
    if (!results.some((item) => item.facility.id === facility.id)) return
    onSelect(facility)
    setOpen(false)
  }

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(showList && results.length ? (safeIndex + 1) % results.length : 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(results.length ? (showList ? safeIndex - 1 + results.length : results.length - 1) % results.length : 0)
    } else if (event.key === "Enter" && showList && results[safeIndex]) {
      event.preventDefault()
      choose(results[safeIndex].facility)
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); inputRef.current?.focus(); setOpen(false) }
      }}>
      {prominent ? (
        <label htmlFor="destination-input" className={cn("mb-2 block text-[17px] font-semibold tracking-[-0.01em] text-ink", labelClassName)}>{label}</label>
      ) : (
        <label htmlFor="destination-input" className={cn("mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft", labelClassName)}>
          <Search className="h-3.5 w-3.5" aria-hidden="true" /> {label}
        </label>
      )}
      <div className="relative">
        <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-faint", prominent ? "left-4 h-5 w-5" : "left-3 h-4 w-4")} aria-hidden="true" />
        <input
          ref={inputRef}
          id="destination-input"
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && results[safeIndex] ? optionId(safeIndex) : undefined}
          aria-describedby={`${listId}-status`}
          value={query}
          onChange={(event) => { onQueryChange(event.target.value); setOpen(true); setActiveIndex(0) }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full border border-line-strong bg-surface font-medium text-ink outline-none transition-colors duration-150 motion-reduce:transition-none placeholder:font-normal placeholder:text-ink-faint focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15",
            // 16px text on phones keeps iOS from zooming the page when the field is focused.
            prominent ? "h-14 rounded-2xl pl-12 pr-11 text-base shadow-soft" : "h-11 rounded-xl pl-9 pr-10 text-base sm:text-sm",
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear destination"
            onClick={() => { onQueryChange(""); inputRef.current?.focus(); setActiveIndex(0); setOpen(false) }}
            className={cn("absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft hover:bg-fill", prominent ? "right-1.5 h-11 w-11" : "right-0 h-11 w-11", focusRing)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div hidden={!showList} data-destination-popup
        style={{ maxHeight: popupHeight }}
        className="map-overlay-surface absolute inset-x-0 top-full z-dropdown mt-1 overflow-y-auto p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <ul id={listId} role="listbox" aria-label="Destination results">
        {results.length === 0 ? (
          <li role="presentation" className="px-3 py-3 text-xs leading-relaxed text-ink-soft">
            <span className="block font-semibold text-ink">No verified result</span>
            Choose a mapped, navigable campus facility.
          </li>
        ) : null}
        {composed.groups.map((group) => group.items.length > 0 && (
          <li key={group.label} role="presentation">
          <ul role="group" aria-label={group.label}>
            <li role="presentation" className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{group.label}</li>
            {group.items.map((item) => {
              const { facility, matches } = item
              const index = results.indexOf(item)
              const category = getFacilityCategory(facility)
              const Icon = category.icon
              const floor = getFloorById(facility.floorId)
              const active = index === safeIndex
              const isDestination = facility.id === destinationId
              return (
                <li
                  key={facility.id}
                  id={optionId(index)}
                  role="option"
                  data-facility-id={facility.id}
                  aria-describedby={matches.length ? `${optionId(index)}-match` : undefined}
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(facility)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn("flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5", active ? "bg-fill" : "hover:bg-fill")}
                >
                  <span aria-hidden="true" className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", category.tile)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{facility.name}</span>
                    <span className="block truncate text-[11px] text-ink-soft">{floor?.name || facility.floorId} · {category.label}</span>
                    {matches.length > 0 && <span id={`${optionId(index)}-match`} className="mt-0.5 block text-xs leading-relaxed text-ink-soft [overflow-wrap:anywhere]">
                      {matches.map((match) => match.alias ? `Alias “${match.alias}” · ${match.serviceName}` : `Service · ${match.serviceName}`).join("; ")}
                    </span>}
                  </span>
                  <span className="shrink-0 rounded-md border border-line-strong px-1.5 py-0.5 font-heading text-[11px] font-semibold tracking-[0.06em] text-ink-mid">{facility.floorId}</span>
                  {isDestination && <Check className="h-4 w-4 shrink-0 text-brand-700" aria-label="Current destination" />}
                </li>
              )
            })}
          </ul>
          </li>
        ))}
      </ul>
      <div className="border-t border-line px-2.5 py-2 text-xs leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">Services</p>
        <p id={`${listId}-status`} role="status" aria-live="polite" aria-atomic="true">
          {results.length} destination choices. {!connectivity.isOnline ? "Service destinations require a connection. Canonical facility search remains available."
            : discovery.loading ? "Loading public service destinations…"
              : !discovery.result?.ok ? "Service destinations are temporarily unavailable. Canonical facility search remains available."
                : !discovery.result.data?.services.length ? "No configured navigable service destinations are available yet."
                  : composed.unmappedServices.length ? `No configured navigable destination for ${composed.unmappedServices.join(", ")}.`
                    : composed.matchedServices.length ? "Choose a canonical facility explicitly; matching service context is shown with each location."
                      : "Search a service name or an exact approved alias."}
        </p>
        {discovery.result?.data?.notices?.pending && <p>Pending service records are excluded.</p>}
        {discovery.result?.data?.notices?.demoExcluded && <p>DEMO service records are excluded.</p>}
        {connectivity.isOnline && !discovery.loading && !discovery.result?.ok && <div className="mt-1 flex flex-wrap gap-1">
          <button type="button" onClick={discovery.retry} className={cn("min-h-11 rounded-lg border border-line-strong px-3 text-ink", focusRing)}>Retry service destinations</button>
          <button type="button" onClick={() => window.location.reload()} className={cn("min-h-11 rounded-lg border border-line-strong px-3 text-ink", focusRing)}>Reload page</button>
        </div>}
      </div>
      </div>
    </div>
  )
}
