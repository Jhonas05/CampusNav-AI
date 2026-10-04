import { Minus, SquarePen, X } from "lucide-react"
import ClaraMark from "./ClaraMark"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

const controlClass = cn("flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-fill-strong hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent", focusRing)

/** @param {Record<string, any>} props */
export default function ClaraHeader(props) {
  const { titleId, descriptionId, canReset, onReset, onMinimize, onClose } = props
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface/95 py-3 pl-4 pr-2.5">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink">
        <ClaraMark className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink">CLARA</h2>
        <p id={descriptionId} className="truncate text-xs text-ink-soft">Campus Digital Concierge</p>
      </div>
      <div className="flex items-center">
        <button type="button" onClick={onReset} disabled={!canReset} aria-label="Start a new conversation" title="New conversation" className={controlClass}>
          <SquarePen className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onMinimize} aria-label="Minimize CLARA" title="Minimize" className={controlClass}>
          <Minus className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        <button type="button" onClick={onClose} aria-label="Close CLARA and end this conversation" title="Close" className={controlClass}>
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
