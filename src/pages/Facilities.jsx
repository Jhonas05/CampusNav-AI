import { Layers, Search, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { button, EmptyState, focusRing, PageHeader } from "@/components/campus/ui"
import FacilityCard from "@/components/facilities/FacilityCard"
import { FACILITY_DATA_NOTICE, facilities } from "@/data/facilities"
import { floors, getFloorById } from "@/data/floors"
import { getCategoryByKey } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

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
  "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200",
  active ? "bg-brand-700 text-white" : "border border-[#D2D2D7] bg-white text-[#6E6E73] hover:border-brand-600 hover:text-[#1D1D1F]",
  focusRing
)

export default function Facilities() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState("All")
  const [floorId, setFloorId] = useState("ALL")

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

  const clearFilters = () => {
    setQuery("")
    setCategory("All")
    setFloorId("ALL")
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F7] px-4 py-12 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Campus directory"
          title="Facilities"
          lead="Find offices, learning spaces, laboratories, services, and campus facilities."
          actions={<p className="shrink-0 text-sm text-[#6E6E73]" role="status">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>}
        />

        <div className="mt-9 rounded-[1.75rem] border border-[#E5E5E7] bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F5F5F7] px-4">
            <Search className="h-4 w-4 shrink-0 text-[#86868B]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by office, service, room, or floor"
              aria-label="Search facilities"
              className="w-full bg-transparent py-3.5 text-sm text-[#1D1D1F] outline-none placeholder:text-[#86868B]"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by category">
            <SlidersHorizontal className="mr-1 h-4 w-4 shrink-0 text-[#86868B]" aria-hidden="true" />
            {CATEGORY_FILTERS.map((filter) => {
              const active = category === filter.label
              const filterCategory = filter.categoryKey ? getCategoryByKey(filter.categoryKey) : null
              return (
                <button
                  key={filter.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(filter.label)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200",
                    active
                      ? filterCategory ? cn("border", filterCategory.chip, "font-semibold shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]") : "bg-brand-700 text-white"
                      : "border border-[#D2D2D7] bg-white text-[#6E6E73] hover:border-brand-600 hover:text-[#1D1D1F]",
                    focusRing
                  )}
                >
                  {filterCategory && <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", filterCategory.dot)} />}
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto border-t border-[#F0F0F2] pb-1 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by floor">
            <Layers className="mr-1 h-4 w-4 shrink-0 text-[#86868B]" aria-hidden="true" />
            <button type="button" aria-pressed={floorId === "ALL"} onClick={() => setFloorId("ALL")} className={chipClass(floorId === "ALL")}>
              All Floors
            </button>
            {floors.map((floor) => (
              <button key={floor.id} type="button" aria-pressed={floorId === floor.id} onClick={() => setFloorId(floor.id)} className={chipClass(floorId === floor.id)}>
                {floor.shortName}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-2xl border border-dashed border-[#C7C7CC] bg-white px-4 py-3 text-xs leading-relaxed text-[#6E6E73]">{FACILITY_DATA_NOTICE}</p>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No facility matches those filters."
            message="Try a different keyword, category, or floor."
            action={<button type="button" onClick={clearFilters} className={button.smallSecondary}>Clear filters</button>}
            className="mt-8 min-h-56"
          />
        )}
      </div>
    </div>
  )
}
