import { Check, Search, X } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"
import { focusRing } from "@/components/campus/ui"
import { getFloorById } from "@/data/floors"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

const MAX_RESULTS = 8
const normalize = (value) => value.trim().toLowerCase()

/**
 * Case-insensitive ranking per the search contract: exact and prefix name
 * matches rank above word-prefix, substring, and floor/category matches.
 * Only the supplied navigable facility records are searched.
 */
const rankFacility = (facility, needle) => {
  const name = facility.name.toLowerCase()
  if (name === needle) return 0
  if (name.startsWith(needle)) return 1
  if (name.split(/[\s'’.&-]+/).some((word) => word.startsWith(needle))) return 2
  if (name.includes(needle)) return 3
  const floor = getFloorById(facility.floorId)
  const context = [facility.floorId, floor?.name, getFacilityCategory(facility).label, facility.kind].filter(Boolean).join(" ").toLowerCase()
  return context.includes(needle) ? 4 : -1
}

/**
 * Destination combobox for Navigate. Typing an exact facility name still
 * resolves through the page's existing query handler; choosing an option
 * also asks the page to focus that facility on the map.
 * @param {Record<string, any>} props
 */
export default function DestinationSearch(props) {
  const { facilities, query, destinationId = "", onQueryChange, onSelect, className } = props
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const optionId = (index) => `${listId}-option-${index}`

  const needle = normalize(query || "")
  const selectedDestination = facilities.find((facility) => facility.id === destinationId)
  // Browse mode (empty field, or the field still shows the chosen destination)
  // lists every navigable destination, like the former native datalist.
  const browsing = !needle || (selectedDestination && normalize(selectedDestination.name) === needle)

  const results = useMemo(() => {
    if (browsing) {
      return [...facilities].sort((a, b) =>
        (getFloorById(a.floorId)?.level ?? 0) - (getFloorById(b.floorId)?.level ?? 0) || a.name.localeCompare(b.name))
    }
    return facilities
      .map((facility) => ({ facility, rank: rankFacility(facility, needle) }))
      .filter((entry) => entry.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.facility.name.localeCompare(b.facility.name))
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.facility)
  }, [browsing, facilities, needle])

  const showList = open

  useEffect(() => {
    if (!showList) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, showList]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (facility) => {
    onSelect(facility)
    setOpen(false)
  }

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (results.length ? (index - 1 + results.length) % results.length : 0))
    } else if (event.key === "Enter" && showList && results[activeIndex]) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="destination-input" className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
        <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search destination
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
        <input
          id="destination-input"
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && results[activeIndex] ? optionId(activeIndex) : undefined}
          value={query}
          onChange={(event) => { onQueryChange(event.target.value); setOpen(true); setActiveIndex(0) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Search rooms, offices, facilities…"
          className="h-11 w-full rounded-xl border border-line-strong bg-surface pl-9 pr-10 text-sm font-medium text-ink outline-none transition-colors duration-150 placeholder:font-normal placeholder:text-ink-ghost focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear destination"
            onClick={() => { onQueryChange(""); setOpen(false) }}
            className={cn("absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft hover:bg-fill", focusRing)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Destination results"
        hidden={!showList}
        onMouseDown={(event) => event.preventDefault()}
        className="map-overlay-surface absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto p-1"
      >
        {results.length === 0 ? (
          <li role="presentation" className="px-3 py-3 text-xs leading-relaxed text-ink-soft">
            <span className="block font-semibold text-ink">No verified result</span>
            Only mapped, navigable campus facilities are searchable here.
          </li>
        ) : (
          <>
            <li role="presentation" className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{browsing ? "All destinations · GF–5F" : "Facilities"}</li>
            {results.map((facility, index) => {
              const category = getFacilityCategory(facility)
              const Icon = category.icon
              const floor = getFloorById(facility.floorId)
              const active = index === activeIndex
              const isDestination = facility.id === destinationId
              return (
                <li
                  key={facility.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={active}
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
                  </span>
                  <span className="shrink-0 rounded-md border border-line-strong px-1.5 py-0.5 font-heading text-[11px] font-semibold tracking-[0.06em] text-ink-mid">{facility.floorId}</span>
                  {isDestination && <Check className="h-4 w-4 shrink-0 text-brand-700" aria-label="Current destination" />}
                </li>
              )
            })}
          </>
        )}
      </ul>
    </div>
  )
}
