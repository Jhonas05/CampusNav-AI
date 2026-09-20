import { MessageCircle, X } from "lucide-react"
import { focusRing } from "@/components/campus/ui"
import { useClara } from "@/contexts/ClaraContext"
import { cn } from "@/lib/utils"

/**
 * Persistent entry point to CLARA.
 *
 * Anchored bottom-right above every CampusNav page. It stays mounted while
 * the panel is open (turning into the close control) so keyboard focus has a
 * stable target, and it sits clear of the iOS home indicator.
 */
export default function ClaraFloatingButton() {
  const { open, toggleClara } = useClara()

  return (
    <button
      type="button"
      onClick={toggleClara}
      aria-expanded={open}
      aria-controls="clara-chat-panel"
      aria-label={open ? "Close CLARA assistant" : "Open CLARA, the campus digital concierge"}
      className={cn(
        "fixed right-5 z-[60] h-14 w-14 items-center justify-center rounded-full border border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-[0_12px_32px_rgba(29,29,31,0.28)]",
        "transition-[transform,background-color] duration-200 hover:scale-[1.04] hover:bg-black active:scale-95 motion-reduce:transform-none motion-reduce:transition-none",
        "sm:right-7 sm:h-[60px] sm:w-[60px]",
        // On phones the panel is a near-fullscreen sheet with its own close
        // control, so the button would only cover the sheet's own controls.
        open ? "hidden sm:flex" : "flex",
        focusRing,
        "focus-visible:ring-offset-[#F5F5F7]"
      )}
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
    >
      {open ? (
        <X className="h-6 w-6" aria-hidden="true" />
      ) : (
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      )}
      <span className="sr-only">CLARA — Campus Learning Alerts &amp; Response Assistant</span>
    </button>
  )
}
