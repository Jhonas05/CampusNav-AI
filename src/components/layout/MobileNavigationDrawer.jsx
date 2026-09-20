import { X } from "lucide-react"
import { useEffect, useRef } from "react"
import Sidebar from "./Sidebar"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Slide-over navigation for phones and small tablets.
 *
 * Holds the same Sidebar used on desktop so there is one navigation
 * definition. Closes on Escape, on backdrop press, and after a destination is
 * chosen; focus is trapped while open and returned to the trigger on close.
 */
export default function MobileNavigationDrawer({ open, onClose }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const frame = window.requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector(FOCUSABLE)
      if (first instanceof HTMLElement) first.focus()
    })

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab" || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(
        (element) => element instanceof HTMLElement && element.offsetParent !== null
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[65] lg:hidden" role="presentation">
      <div
        aria-hidden="true"
        onMouseDown={onClose}
        className="absolute inset-0 bg-[#1D1D1F]/45 backdrop-blur-sm animate-overlay-in motion-reduce:animate-none"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="CampusNav navigation"
        className="absolute inset-y-0 left-0 flex w-[min(19rem,86vw)] flex-col border-r border-[#D2D2D7] bg-white shadow-[0_0_60px_rgba(29,29,31,0.25)] animate-drawer-in motion-reduce:animate-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className={cn(
            "absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[#1D1D1F] transition-colors duration-200 hover:bg-[#F0F0F2]",
            focusRing
          )}
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        <Sidebar variant="drawer" onNavigate={onClose} />
      </div>
    </div>
  )
}
