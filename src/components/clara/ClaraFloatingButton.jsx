import { ChevronDown } from "lucide-react"
import { forwardRef } from "react"
import ClaraMark from "./ClaraMark"
import { cn } from "@/lib/utils"

/**
 * Lower-right CLARA trigger. A 56px circle on phones and tablets, and an
 * "Ask CLARA" pill on wide screens. `compact` keeps the circle at every
 * width (used on Navigate so the map keeps as much room as possible). `--clara-lift` lets a page raise the
 * button above its own bottom sheet (see MobileRouteSheet).
 */
const ClaraFloatingButton = forwardRef(function ClaraFloatingButton(/** @type {Record<string, any>} */ props, ref) {
  const { open, hasConversation, compact = false, onClick, className } = props
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={open ? "Minimize CLARA campus assistant" : "Open CLARA campus assistant"}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="clara-chat-panel"
      data-idle={!open ? "true" : undefined}
      className={cn(
        "fixed right-4 z-clara-button flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-full bg-ink text-on-ink shadow-[0_2px_6px_rgba(0,0,0,0.16),0_10px_28px_rgba(0,0,0,0.2)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-ink-strong active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none sm:right-6 print:hidden",
        "clara-floating-button",
        !compact && "xl:pl-5 xl:pr-6",
        "bottom-[calc(1rem+env(safe-area-inset-bottom)+var(--clara-lift,0px))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom)+var(--clara-lift,0px))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
        open && "max-sm:hidden",
        className
      )}
    >
      {open ? <ChevronDown className="h-5 w-5" aria-hidden="true" /> : <ClaraMark className="h-[22px] w-[22px]" />}
      {!compact && <span className="hidden text-[15px] font-semibold tracking-[-0.01em] xl:inline">{open ? "Minimize" : "Ask CLARA"}</span>}
      {!open && hasConversation && (
        <>
          <span aria-hidden="true" className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-surface" />
          <span className="sr-only">Conversation in progress</span>
        </>
      )}
    </button>
  )
})

export default ClaraFloatingButton
