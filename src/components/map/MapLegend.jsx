import { ListTree, X } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { focusRing } from "@/components/campus/ui"
import { listMapCategories, MAP_COLORS } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

const LegendRow = ({ swatch, label, semantic = false }) => (
  <li className="flex items-center gap-2.5 text-[12px] leading-tight text-ink">
    <span aria-hidden="true" className={cn("flex h-4 w-6 shrink-0 items-center justify-center", semantic && "map-semantic")}>{swatch}</span>
    <span>{label}</span>
  </li>
)

/**
 * Compact, optional legend for the 2D/3D maps. It lists only marks the
 * current view actually draws, plus the facility categories present on the
 * viewed floor. Presentation only.
 * @param {Record<string, any>} props
 */
export default function MapLegend(props) {
  const { floorFacilities, emergencyMode = false, mapView = "2D", defaultOpen = false, className } = props
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const categories = listMapCategories(floorFacilities)
  // The 2D map inverts lightness in dark mode; its swatches follow it.
  const semantic = mapView === "2D"
  // Both renderers draw floor-change markers in the active route color.
  const routeColor = emergencyMode ? MAP_COLORS.emergencyRoute : MAP_COLORS.route
  const hasConstruction = floorFacilities.some((facility) => facility.status === "UNDER_CONSTRUCTION")

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className={cn("pointer-events-auto relative", className)}>
      {open && (
        <section
          id={panelId}
          aria-label="Map legend"
          className="map-overlay-surface absolute bottom-full left-0 mb-2 max-h-[min(26rem,55vh)] w-[min(17.5rem,calc(100vw-3rem))] overflow-y-auto p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="ink-section-label">Legend</p>
            <button type="button" aria-label="Close legend" onClick={() => setOpen(false)} className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft hover:bg-fill", focusRing)}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            <LegendRow label="You are here" swatch={<span className="h-3 w-3 rounded-full border-2 border-on-ink bg-ink shadow-[0_0_0_1.5px_rgb(var(--ink))]" />} />
            {!emergencyMode && (
              <LegendRow
                label="Destination"
                swatch={<svg viewBox="0 0 20 22" className="h-4 w-4"><path d="M10 21L2.5 9A8.5 8.5 0 1 1 17.5 9Z" fill={MAP_COLORS.destination} stroke="#fff" strokeWidth="1.5" /><circle cx="10" cy="8" r="3" fill="#fff" /></svg>}
                semantic={semantic}
              />
            )}
            <LegendRow
              label={emergencyMode ? "Approved evacuation path" : "Route"}
              swatch={emergencyMode
                ? <span className="h-[4px] w-6" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${MAP_COLORS.emergencyRoute} 0, ${MAP_COLORS.emergencyRoute} 6px, transparent 6px, transparent 9px)` }} />
                : <span className="h-[5px] w-6 rounded-full" style={{ backgroundColor: MAP_COLORS.route, boxShadow: `0 0 0 1px ${MAP_COLORS.routeOutline}` }} />}
              semantic={semantic}
            />
            <LegendRow label="Stairs" swatch={<span className="h-3.5 w-5 border" style={{ borderColor: MAP_COLORS.stairs, backgroundImage: `repeating-linear-gradient(0deg, ${MAP_COLORS.stairs} 0, ${MAP_COLORS.stairs} 1px, transparent 1px, transparent 4px)` }} />} semantic={semantic} />
            <LegendRow label="Floor change on route" swatch={<span className="flex h-4 w-4 items-center justify-center rounded-[3px] border-2 text-[9px] font-bold leading-none" style={{ backgroundColor: "#FFFFFF", borderColor: routeColor, color: routeColor }}>↑</span>} semantic={semantic} />
            {mapView === "3D" && <LegendRow label="QR checkpoint" swatch={<span className="h-2.5 w-2.5 rotate-45 border border-ink-faint" />} />}
            {hasConstruction && <LegendRow label="Under construction · not navigable" swatch={<span className="h-3.5 w-5 border border-line-strong [background-image:repeating-linear-gradient(45deg,#A3A3A6_0,#A3A3A6_2px,#F2F2F1_2px,#F2F2F1_6px)]" />} />}
            {emergencyMode && (
              <>
                {mapView === "2D"
                  ? <LegendRow label="Verified exit" swatch={<span className="inline-flex h-3.5 items-center rounded-[3px] px-1 text-[7px] font-black text-white" style={{ backgroundColor: MAP_COLORS.exit }}>EXIT</span>} semantic={semantic} />
                  : <LegendRow label="Verified exit" swatch={<span className="inline-flex h-3.5 items-center rounded-[3px] border border-ink bg-surface px-1 text-[7px] font-black text-ink">EXIT</span>} />}
                <LegendRow
                  label="Emergency-approved edges"
                  swatch={<span className="h-[3px] w-6" style={{ opacity: mapView === "2D" ? 0.65 : 0.5, backgroundImage: `repeating-linear-gradient(90deg, ${mapView === "2D" ? MAP_COLORS.exit : "#48484A"} 0, ${mapView === "2D" ? MAP_COLORS.exit : "#48484A"} 5px, transparent 5px, transparent 9px)` }} />}
                  semantic={semantic}
                />
                {mapView === "2D" && <LegendRow label="Fire extinguisher (FE) / alarm" swatch={<span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: MAP_COLORS.equipment }} />} semantic={semantic} />}
              </>
            )}
          </ul>
          {categories.length > 0 && (
            <>
              <p className="mt-3 border-t border-line pt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">Facilities on this floor</p>
              <ul className="mt-2 grid grid-cols-1 gap-1.5">
                {categories.map((category) => (
                  <LegendRow key={category.key} label={category.label} swatch={<span className="h-3 w-4 rounded-[3px] border" style={{ backgroundColor: category.map.fill, borderColor: category.map.stroke }} />} semantic={semantic} />
                ))}
              </ul>
            </>
          )}
          {mapView === "3D" && (
            <p className="mt-3 border-t border-line pt-2.5 text-[11px] leading-snug text-ink-soft">
              The optional animated dot previews route direction only. It is not your live position.
            </p>
          )}
        </section>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn("map-overlay-surface inline-flex h-10 items-center gap-1.5 px-3 font-heading text-[13px] font-semibold text-ink hover:text-brand-800", open && "border-ink", focusRing)}
      >
        <ListTree className="h-4 w-4" aria-hidden="true" /> Legend
      </button>
    </div>
  )
}
