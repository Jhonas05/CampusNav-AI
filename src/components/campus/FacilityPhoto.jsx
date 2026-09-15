import { ImagePlus } from "lucide-react"
import { useState } from "react"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

/**
 * Photo slot for offices, laboratories, classrooms, and clinics.
 * Looks for `public/images/facilities/<facility-id>.jpg`; until a photo is
 * added, a polished category-tinted placeholder renders instead, so future
 * image insertion needs no code changes.
 */
const VARIANTS = {
  banner: "aspect-[3/1] max-h-72 min-h-36 w-full",
  card: "aspect-[16/10] w-full",
  thumb: "h-20 w-28",
}

/** @param {Record<string, any>} props */
export default function FacilityPhoto(props) {
  const { facility, variant = "card", className, showHint = false } = props
  const [missing, setMissing] = useState(false)
  const category = getFacilityCategory(facility)
  const Icon = category.icon

  if (!missing) {
    return (
      <img
        src={`/images/facilities/${facility.id}.jpg`}
        alt={`${facility.name} photo`}
        onError={() => setMissing(true)}
        className={cn(VARIANTS[variant], "shrink-0 object-cover", className)}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`${facility.name} photo placeholder`}
      className={cn(
        VARIANTS[variant],
        "relative flex shrink-0 flex-col items-center justify-center overflow-hidden",
        category.tile,
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]"
      />
      <Icon aria-hidden="true" className={cn("relative", variant === "thumb" ? "h-5 w-5" : "h-8 w-8")} />
      {showHint && variant !== "thumb" && (
        <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <ImagePlus className="h-3 w-3" aria-hidden="true" /> Photo slot
        </span>
      )}
    </div>
  )
}
