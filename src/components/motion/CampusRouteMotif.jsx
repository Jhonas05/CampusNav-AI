import { cn } from "@/lib/utils"

/**
 * Decorative route motif: origin · waypoint · destination. It is abstract
 * decoration, never a real campus route, so it is hidden from assistive
 * technology. The dashed segment travels when a parent `.group` is hovered
 * or when `play` is set.
 * @param {Record<string, any>} props
 */
export default function CampusRouteMotif(props) {
  const { play = false, className } = props
  return (
    <svg viewBox="0 0 72 12" aria-hidden="true" data-play={play ? "true" : undefined} className={cn("route-motif h-3 w-[72px] shrink-0 text-ink-faint", className)}>
      <path className="route-motif-line" d="M8 6 H60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="6" r="3" fill="currentColor" />
      <circle cx="33" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" style={{ fill: "rgb(var(--surface))" }} />
      <circle className="route-motif-ring" cx="63" cy="6" r="4.5" fill="none" strokeWidth="1" opacity="0" style={{ stroke: "rgb(var(--ink))" }} />
      <circle cx="63" cy="6" r="4" strokeWidth="1.75" style={{ fill: "rgb(var(--surface))", stroke: "rgb(var(--ink))" }} />
      <circle cx="63" cy="6" r="1.4" style={{ fill: "rgb(var(--ink))" }} />
    </svg>
  )
}
