import { Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BlueprintPanel, button, focusRing, PageHeader } from "@/components/campus/ui"
import FacilityCard from "@/components/facilities/FacilityCard"
import MobileBottomSheet from "@/components/layout/MobileBottomSheet"
import { FACILITY_DATA_NOTICE, facilities } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { getCategoryByKey } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"
import { getFacilitiesDirectory } from "@/services/facilityService"

/**
 * Presentation-only groupings over verified facility kinds.
 * "Student Services" lists the known student-service offices by id.
 */
const CATEGORY_FILTERS = [
  { label: "All", categoryKey: null, matches: () => true },
  { label: "Offices", categoryKey: "administrative", matches: (facility) => facility.kind === "Office" },
  { label: "Academic", categoryKey: "classroom", matches: (facility) => facility.kind === "Academic" || facility.kind === "Room" },
  { label: "Laboratories", categoryKey: "laboratory", matches: (facility) => facility.kind === "Laboratory" },
  { label: "Health", categoryKey: "health", matches: (facility) => facility.kind === "Clinic" },
  { label: "Student Services", categoryKey: "studentServices", matches: (facility) => ["guidance-office", "osas"].includes(facility.id) },
  { label: "Food", categoryKey: "food", matches: (facility) => facility.kind === "Dining" },
]

const chipClass = (active) => cn(
  "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 lg:min-h-9 lg:text-xs",
  active ? "bg-brand-700 text-on-ink" : "border border-line-strong bg-surface text-ink-soft hover:border-brand-600 hover:text-ink",
  focusRing
)

/** Category choices: the desktop rail and the phone Filters sheet render the same group. */
function CategoryFilter({ category, onSelect, className }) {
  return (
    <div role="group" aria-label="Filter by category" className={className}>
      {CATEGORY_FILTERS.map((filter) => {
        const active = category === filter.label
        const filterCategory = filter.categoryKey ? getCategoryByKey(filter.categoryKey) : null
        return (
          <button
            key={filter.label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(filter.label)}
            className={cn(
              "inline-flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-[15px] font-medium transition-colors duration-200 lg:min-h-9 lg:rounded-full lg:text-xs",
              active
                ? filterCategory ? cn("border", filterCategory.chip, "font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]") : "bg-brand-700 text-on-ink"
                : "border border-line-strong bg-surface text-ink-soft hover:border-brand-600 hover:text-ink",
              focusRing
            )}
          >
            {filterCategory && <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", filterCategory.dot)} />}
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

export default function Facilities() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState("All")
  const [floorId, setFloorId] = useState("ALL")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)
  const [operationalState, setOperationalState] = useState({ loading: true, result: null })

  useEffect(() => {
    let active = true
    setOperationalState((state) => ({ ...state, loading: true }))
    getFacilitiesDirectory()
      .then((result) => {
        if (active) setOperationalState({ loading: false, result })
      })
      .catch(() => {
        if (active) setOperationalState({ loading: false, result: null })
      })
    return () => { active = false }
  }, [requestVersion])

  const directoryById = useMemo(() => new Map(
    (operationalState.result?.data?.facilities || []).map((entry) => [entry.facility.id, entry]),
  ), [operationalState.result])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const activeCategory = CATEGORY_FILTERS.find((filter) => filter.label === category) || CATEGORY_FILTERS[0]
    return facilities.filter((facility) => {
      if (!activeCategory.matches(facility)) return false
      if (floorId !== "ALL" && facility.floorId !== floorId) return false
      const floor = getFloorById(facility.floorId)
      const searchable = [facility.name, facility.kind, facility.floorId, floor?.name].filter(Boolean).join(" ").toLowerCase()
      return !needle || searchable.includes(needle)
    })
  }, [category, floorId, query])

  const overlayUnavailable = !operationalState.loading && (
    !operationalState.result || !operationalState.result.ok
  )

  const clearFilters = () => {
    setQuery("")
    setCategory("All")
    setFloorId("ALL")
  }

  return (
    <div className="app-page bg-canvas">
      <div className="app-container">
        <PageHeader
          compact
          eyebrow="Campus directory"
          title="Facilities"
          lead="Offices, rooms, laboratories, and services."
        />

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] items-start gap-3 sm:mt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[232px_minmax(0,1fr)]">
          {/* A plain search + one chip row on phones and tablets; a filter rail from 1024px. */}
          <BlueprintPanel className="max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none lg:sticky lg:top-4 lg:p-4" aria-label="Facility search and filters">
            <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface px-4 lg:border-transparent lg:bg-fill">
              <Search className="h-5 w-5 shrink-0 text-ink-faint lg:h-4 lg:w-4" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search facilities"
                aria-label="Search facilities"
                className="h-12 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint lg:text-sm"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className={cn("-mr-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:text-ink", focusRing)}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <p className="mb-2 mt-4 hidden items-center gap-2 font-heading text-xs font-semibold text-ink-soft lg:flex"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Category</p>
            <CategoryFilter category={category} onSelect={setCategory} className="hidden flex-col gap-2 lg:flex" />

            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-lg:-mx-[var(--app-page-gutter)] max-lg:px-[var(--app-page-gutter)] lg:overflow-visible lg:border-t lg:border-line lg:pt-3 [&::-webkit-scrollbar]:hidden">
              <button type="button" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" aria-label={category === "All" ? "Filters" : `Filters, category: ${category}`} className={cn(chipClass(category !== "All"), "gap-1.5 lg:hidden")}>
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> {category === "All" ? "Filters" : category}
              </button>
              <div role="group" aria-label="Filter by floor" className="flex items-center gap-2 lg:flex-wrap">
                <button type="button" aria-pressed={floorId === "ALL"} onClick={() => setFloorId("ALL")} className={chipClass(floorId === "ALL")}>
                  All<span className="max-lg:sr-only">&nbsp;floors</span>
                </button>
                {floors.map((floor) => (
                  <button key={floor.id} type="button" aria-pressed={floorId === floor.id} aria-label={`${floor.shortName}, ${floor.name}`} title={floor.name} onClick={() => setFloorId(floor.id)} className={chipClass(floorId === floor.id)}>
                    {floor.shortName}
                  </button>
                ))}
              </div>
            </div>
          </BlueprintPanel>

          <div className="min-w-0 sm:pr-20 xl:pr-44">
            <p className="text-sm text-ink-soft" role="status">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>

            {operationalState.loading && (
              <p role="status" aria-live="polite" className="mt-2 text-[13px] text-ink-soft">Loading facility status…</p>
            )}
            {overlayUnavailable && (
              <div role="alert" className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink-faint bg-subtle px-4 py-3">
                <p className="text-[13px] leading-relaxed text-ink">Facility information is temporarily unavailable. Canonical locations remain available.</p>
                <button type="button" onClick={() => setRequestVersion((value) => value + 1)} className={cn(button.smallSecondary, "min-h-11")}>Retry</button>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
                {filtered.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    operational={directoryById.get(facility.id) || null}
                    operationalLoading={operationalState.loading}
                  />
                ))}
              </div>
            ) : (
              <div role="status" className="mt-6 text-center">
                <p className="text-[15px] font-semibold text-ink">No facilities match.</p>
                <button type="button" onClick={clearFilters} className={cn(button.smallSecondary, "mt-3 min-h-11")}>Clear filters</button>
              </div>
            )}

            <p className="mt-5 text-[12px] leading-relaxed text-ink-faint">{FACILITY_DATA_NOTICE}</p>
          </div>
        </div>
      </div>

      <MobileBottomSheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters" hideFrom="lg">
        <p className="px-2 pb-2 text-[13px] font-medium text-ink-soft">Category</p>
        <CategoryFilter category={category} onSelect={(label) => { setCategory(label); setFiltersOpen(false) }} className="grid gap-2 px-2" />
      </MobileBottomSheet>
    </div>
  )
}
