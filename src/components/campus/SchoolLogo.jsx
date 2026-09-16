import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * St. Clare College of Caloocan seal.
 * Uses the canonical release asset `public/branding/scc-logo.png`, then the
 * existing blue/gold monogram placeholder if that approved asset cannot load.
 */
const SOURCES = ["/branding/scc-logo.png"]

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
}

/** @param {Record<string, any>} props */
export default function SchoolLogo(props) {
  const { size = "md", className } = props
  const [sourceIndex, setSourceIndex] = useState(0)

  if (sourceIndex < SOURCES.length) {
    return (
      <img
        src={SOURCES[sourceIndex]}
        alt="St. Clare College of Caloocan logo"
        onError={() => setSourceIndex((current) => current + 1)}
        className={cn(SIZES[size], "shrink-0 rounded-full object-contain ring-1 ring-black/5", className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label="St. Clare College of Caloocan logo placeholder"
      className={cn(SIZES[size], "flex shrink-0 items-center justify-center rounded-full border-2 border-gold-500 bg-brand-700 shadow-[inset_0_0_0_2px_#FFFFFF]", className)}
    >
      <span className={cn("font-bold tracking-tight text-white", size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-base")}>SCC</span>
    </span>
  )
}
