import { cn } from "@/lib/utils"

/**
 * CLARA mark — a simple monochrome concierge glyph (speech bubble with a
 * location point). Original artwork; no robot or brand imagery.
 * @param {Record<string, any>} props
 */
export default function ClaraMark(props) {
  const { className } = props
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z" />
      <circle cx="12" cy="11.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
