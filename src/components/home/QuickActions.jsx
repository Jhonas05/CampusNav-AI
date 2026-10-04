import { ArrowRight, Building2, CalendarDays, Navigation, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"
import ClaraMark from "@/components/clara/ClaraMark"
import { useClara } from "@/components/clara/ClaraContext"
import CampusRouteMotif from "@/components/motion/CampusRouteMotif"
import InteractiveCard from "@/components/motion/InteractiveCard"
import { StaggerGroup } from "@/components/motion/MotionReveal"
import QRCheckpointMotif from "@/components/motion/QRCheckpointMotif"

const iconTile = "card-icon flex h-10 w-10 items-center justify-center rounded-xl bg-fill text-ink"

function ActionBody({ icon, title, detail, motif = null }) {
  return (
    <span className="flex h-full flex-col p-4">
      <span className="flex items-start justify-between gap-3">
        {icon}
        <ArrowRight className="card-arrow mt-1 h-4 w-4 text-ink-ghost group-hover:text-ink" aria-hidden="true" />
      </span>
      <span className="mt-4 block text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{detail}</span>
      {motif && <span className="mt-auto block pt-3">{motif}</span>}
    </span>
  )
}

/**
 * Home quick actions. Every card opens an existing CampusNav flow; the small
 * route and QR motifs are decoration only.
 */
export default function QuickActions() {
  const { openClara } = useClara()
  return (
    <StaggerGroup className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <InteractiveCard as={Link} to="/map">
        <ActionBody icon={<span className={iconTile}><Navigation className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" /></span>} title="Navigate Campus" detail="Routes across GF–5F" motif={<CampusRouteMotif />} />
      </InteractiveCard>
      <InteractiveCard as={Link} to="/facilities">
        <ActionBody icon={<span className={iconTile}><Building2 className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" /></span>} title="Find a Facility" detail="Offices, rooms, labs" />
      </InteractiveCard>
      <InteractiveCard as={Link} to="/map">
        <ActionBody icon={<QRCheckpointMotif className="card-icon" />} title="Scan QR" detail="Set your location in Navigate" />
      </InteractiveCard>
      <InteractiveCard as={Link} to="/events">
        <ActionBody icon={<span className={iconTile}><CalendarDays className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" /></span>} title="View Events" detail="Published campus events" />
      </InteractiveCard>
      <InteractiveCard as={Link} to="/emergency" className="border-[1.5px] border-ink">
        <ActionBody icon={<span className="card-icon flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-on-ink"><ShieldAlert className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" /></span>} title="Emergency Information" detail="Verified safety guidance" />
      </InteractiveCard>
      <InteractiveCard as="button" type="button" onClick={() => openClara()}>
        <ActionBody icon={<span className={iconTile}><ClaraMark className="h-5 w-5" /></span>} title="Ask CLARA" detail="Campus digital concierge" />
      </InteractiveCard>
    </StaggerGroup>
  )
}
