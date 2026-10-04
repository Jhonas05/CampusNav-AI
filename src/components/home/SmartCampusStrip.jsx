import { Box, Building2, Layers3, QrCode } from "lucide-react"
import { Link } from "react-router-dom"
import { facilities } from "@/data/facilities"
import { floors } from "@/data/floors"
import { cn } from "@/lib/utils"

const mappedFloors = [...floors].filter((floor) => floor.map).sort((a, b) => a.level - b.level)
const mappedFacilityCount = facilities.filter((facility) => facility.kind !== "Construction" && facility.mapRoomId).length
const floorRange = mappedFloors.length ? `${mappedFloors[0].shortName}–${mappedFloors.at(-1).shortName}` : "—"

/**
 * Compact facts about what CampusNav covers, derived from the canonical floor
 * and facility datasets (no live, availability, or usage figures). Each cell
 * opens the page that provides that capability.
 * @param {Record<string, any>} props
 */
export default function SmartCampusStrip(props) {
  const { className } = props
  const items = [
    { icon: Layers3, value: floorRange, label: `${mappedFloors.length} floors mapped`, to: "/map" },
    { icon: Building2, value: String(mappedFacilityCount), label: "facilities on the map", to: "/facilities" },
    { icon: QrCode, value: "QR + manual", label: "indoor positioning", to: "/map" },
    { icon: Box, value: "2D + 3D", label: "one route, both views", to: "/map" },
  ]

  return (
    <ul aria-label="CampusNav coverage" className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4", className)}>
      {items.map(({ icon: Icon, value, label, to }) => (
        <li key={label} className="bg-surface">
          <Link
            to={to}
            aria-label={`${value}, ${label}`}
            className="group flex h-full items-center gap-3 px-3.5 py-3.5 transition-colors duration-150 hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-subtle text-ink-soft transition-colors duration-150 group-hover:text-ink"><Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" /></span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-tight tracking-[-0.01em] text-ink tabular-nums">{value}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">{label}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
