import { useRef } from "react"
import { cssVars, useInView, usePointerParallax } from "./hooks"
import { cn } from "@/lib/utils"

/**
 * Abstract campus-navigation graph: hallway-like lines, navigation nodes, a
 * QR checkpoint glyph, and a destination marker. It is deliberately
 * non-geographic decoration — not the St. Clare floor plan and not a route —
 * so it is hidden from assistive technology.
 *
 * Three depth layers respond to the pointer by a few pixels; a marker slowly
 * travels the highlighted path. Ambient motion runs only while on screen.
 */
const NODES_FAR = [[70, 60], [210, 60], [210, 150], [360, 150], [360, 250], [520, 250], [520, 90], [680, 90], [680, 210], [820, 210], [130, 250], [130, 340], [300, 340], [760, 320], [900, 120]]
const EDGES_FAR = "M70 60H210V150H360V250H520V90H680V210H820 M210 150H130V340H300 M360 250V340H300 M680 210V320H760 M820 210V120H900 M520 250V340H620"
const ROUTE = "M130 250 H360 V150 H520 V90 H680 V210 H820"

/** @param {Record<string, any>} props */
export default function CampusGraphBackground(props) {
  const { className, interactiveRef = null, dense = true } = props
  const ownRef = useRef(null)
  const [viewRef, inView] = useInView({ once: false, margin: "0px", threshold: 0.05 })
  usePointerParallax(interactiveRef || ownRef)

  return (
    <div
      ref={(node) => { ownRef.current = node; viewRef.current = node }}
      aria-hidden="true"
      data-ambient={inView ? "on" : "off"}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden text-ink", className)}
    >
      <svg viewBox="0 0 960 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <g className="parallax-layer" style={cssVars({ "--depth": 3 })} opacity="0.5">
          <path d={EDGES_FAR} fill="none" strokeWidth="1.25" style={{ stroke: "rgb(var(--line-strong))" }} />
          {NODES_FAR.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" strokeWidth="1.25" style={{ fill: "rgb(var(--canvas-raised))", stroke: "rgb(var(--ink-ghost))" }} />)}
        </g>

        {dense && (
          <g className="parallax-layer" style={cssVars({ "--depth": 6 })}>
            <path d={ROUTE} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "rgb(var(--ink-ghost))" }} />
            <path className="ambient graph-flow" d={ROUTE} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            {/* origin */}
            <circle className="ambient graph-pulse" cx="130" cy="250" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="130" cy="250" r="5" fill="currentColor" />
            {/* QR checkpoint glyph */}
            <g transform="translate(508 78)" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7">
              <path d="M0 7V2a2 2 0 0 1 2-2h5M17 0h5a2 2 0 0 1 2 2v5M24 17v5a2 2 0 0 1-2 2h-5M7 24H2a2 2 0 0 1-2-2v-5" />
              <rect x="8" y="8" width="8" height="8" rx="1.5" fill="currentColor" stroke="none" opacity="0.5" />
            </g>
            {/* travelling marker */}
            <circle className="ambient graph-traveller ambient-desktop" r="4" fill="currentColor" style={{ offsetPath: `path("${ROUTE}")` }} />
          </g>
        )}

        <g className="parallax-layer" style={cssVars({ "--depth": 10 })}>
          {/* destination */}
          <circle className="ambient graph-pulse" cx="820" cy="210" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="820" cy="210" r="8" stroke="currentColor" strokeWidth="2" style={{ fill: "rgb(var(--canvas-raised))" }} />
          <circle cx="820" cy="210" r="2.75" fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}
