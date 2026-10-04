import { MapPin, Navigation, Search } from "lucide-react"
import { SectionHeader } from "@/components/campus/ui"
import ClaraMark from "@/components/clara/ClaraMark"
import { useInView } from "@/components/motion/hooks"
import { StaggerGroup } from "@/components/motion/MotionReveal"
import QRCheckpointMotif from "@/components/motion/QRCheckpointMotif"

const STEPS = [
  { number: "01", title: "Search", body: "Find classrooms, offices, laboratories, and campus services in the verified facility directory.", icon: Search },
  { number: "02", title: "Locate", body: "Set where you are by scanning a QR checkpoint or choosing your location manually.", icon: MapPin, qr: true },
  { number: "03", title: "Navigate", body: "CampusNav calculates a walkable route across GF–5F and guides you step by step in 2D or 3D.", icon: Navigation },
  { number: "04", title: "Ask CLARA", body: "Ask where an office or room is without leaving the page you are on.", clara: true },
]

/**
 * "How CampusNav works": four real steps joined by a route line that draws
 * once when the section scrolls into view. The line is decorative.
 */
export default function HowItWorks() {
  const [ref, inView] = useInView()
  return (
    <section aria-labelledby="how-it-works-title" className="px-[var(--app-page-gutter)] py-10 sm:py-12">
      <div className="mx-auto max-w-[var(--app-max-width)]">
        <SectionHeader eyebrow="How CampusNav works" title="From where you are to where you need to be" />
        <h2 id="how-it-works-title" className="sr-only">How CampusNav works</h2>
        <div ref={ref} data-draw data-inview={inView ? "true" : undefined} className="relative mt-7">
          <svg aria-hidden="true" viewBox="0 0 1000 8" preserveAspectRatio="none" className="absolute inset-x-[6%] top-[22px] hidden h-2 w-[88%] text-ink lg:block">
            <path d="M0 4H1000" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ stroke: "rgb(var(--line-strong))" }} />
            <path className="route-draw" d="M0 4H1000" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength="400" />
          </svg>
          <StaggerGroup as="ol" className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map(({ number, title, body, icon: Icon, qr, clara }) => (
              <li key={number} className="group">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface text-ink shadow-soft">
                  {qr ? <QRCheckpointMotif className="h-7 w-7 [&_svg:last-of-type]:h-3.5 [&_svg:last-of-type]:w-3.5" /> : clara ? <ClaraMark className="h-[18px] w-[18px]" /> : <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />}
                </span>
                <p className="mt-4 font-mono text-[11px] font-medium text-ink-faint">{number}</p>
                <h3 className="mt-0.5 text-[17px] font-semibold tracking-[-0.015em] text-ink">{title}</h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">{body}</p>
              </li>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  )
}
