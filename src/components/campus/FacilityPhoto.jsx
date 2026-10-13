import { ImagePlus } from "lucide-react"
import { useState } from "react"
import { getFacilityCategory } from "@/lib/facilityCategories"
import { cn } from "@/lib/utils"

/**
 * Photo slot for offices, laboratories, classrooms, and clinics.
 * Renders an image only when the facility record carries an approved
 * `photoSrc` (for example `/images/facilities/<facility-id>.jpg`); it is
 * loaded lazily. Without one, a category-tinted placeholder with the
 * category icon renders and no image request is made. No facility has an
 * approved photo yet.
 */
const VARIANTS = {
  banner: "aspect-[3/1] max-h-60 min-h-32 w-full",
  card: "aspect-[16/8] min-h-32 w-full",
  thumb: "h-20 w-28",
}

/** @param {Record<string, any>} props */
export default function FacilityPhoto(props) {
  // `placeholderClassName` lets a page drop the placeholder (never a real photo) where space is tight.
  const { facility, variant = "card", className, placeholderClassName, showHint = false } = props
  const [missing, setMissing] = useState(false)
  const category = getFacilityCategory(facility)
  const Icon = category.icon

  // No approved photo reference, no request: guessing a file name per facility
  // produced one failed image request per card.
  if (facility.photoSrc && !missing) {
    return (
      <img
        src={facility.photoSrc}
        alt={`${facility.name} photo`}
        loading="lazy"
        decoding="async"
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
        className,
        placeholderClassName
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]"
      />
      <Icon aria-hidden="true" className={cn("relative", variant === "thumb" ? "h-5 w-5" : "h-8 w-8")} />
      {showHint && variant !== "thumb" && (
        <span className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <ImagePlus className="h-3 w-3" aria-hidden="true" /> Photo slot
        </span>
      )}
    </div>
  )
}
