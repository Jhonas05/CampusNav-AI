import { QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * QR checkpoint motif. Static at rest; on hover of a parent `.group` (or when
 * `play` is set) the four corner brackets open slightly and a single scan line
 * sweeps once. Decorative only.
 * @param {Record<string, any>} props
 */
export default function QRCheckpointMotif(props) {
  const { play = false, className } = props
  return (
    <span aria-hidden="true" data-play={play ? "true" : undefined} className={cn("qr-motif relative flex h-10 w-10 items-center justify-center text-ink", className)}>
      <svg viewBox="0 0 40 40" className="qr-bracket absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M3 11V6a3 3 0 0 1 3-3h5M29 3h5a3 3 0 0 1 3 3v5M37 29v5a3 3 0 0 1-3 3h-5M11 37H6a3 3 0 0 1-3-3v-5" />
      </svg>
      <QrCode className="h-[18px] w-[18px]" strokeWidth={1.9} />
      <span className="qr-scanline absolute left-2 right-2 top-2 h-px bg-ink" />
    </span>
  )
}
