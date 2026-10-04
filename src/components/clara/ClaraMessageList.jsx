import { ArrowRight, CircleAlert, RotateCcw, SearchX } from "lucide-react"
import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import ClaraMark from "./ClaraMark"
import ClaraResultCard from "./ClaraResultCard"
import { button } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** @param {Record<string, any>} props */
export function ClaraMessage(props) {
  const { message, onNavigate, onRetry } = props

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[84%] whitespace-pre-wrap break-words rounded-[18px] rounded-br-md bg-ink px-3.5 py-2.5 text-sm leading-relaxed text-on-ink">
          <span className="sr-only">You said: </span>{message.text}
        </p>
      </div>
    )
  }

  const unverified = message.verified === false && !message.error
  return (
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink">
        <ClaraMark className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 max-w-[88%]">
        <div className={cn(
          "rounded-[18px] rounded-tl-md px-3.5 py-2.5",
          message.error ? "border-[1.5px] border-ink bg-surface" : unverified ? "border border-dashed border-ink-faint bg-surface" : "bg-fill-strong"
        )}>
          {(message.error || unverified) && (
            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              {message.error ? <CircleAlert className="h-3 w-3" aria-hidden="true" /> : <SearchX className="h-3 w-3" aria-hidden="true" />}
              {message.error ? "Couldn't reach CLARA" : "No verified information"}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink"><span className="sr-only">CLARA said: </span>{message.text}</p>
        </div>
        {message.facility && <ClaraResultCard facility={message.facility} onNavigate={onNavigate} />}
        {message.link && (
          <Link to={message.link.href} onClick={onNavigate} className={cn(button.smallSecondary, "mt-2")}>
            {message.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        {message.error && message.retryText && (
          <button type="button" onClick={() => onRetry(message.retryText)} className={cn(button.smallSecondary, "mt-2")}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
          </button>
        )}
      </div>
    </div>
  )
}

function ClaraThinking() {
  return (
    <div className="flex items-center gap-2.5" role="status">
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink">
        <ClaraMark className="h-3.5 w-3.5" />
      </span>
      <span className="flex items-center gap-1 rounded-[18px] rounded-tl-md bg-fill-strong px-4 py-3.5">
        {[0, 1, 2].map((dot) => (
          <span key={dot} aria-hidden="true" className="clara-typing-dot h-1.5 w-1.5 rounded-full bg-ink-soft" style={{ animationDelay: `${dot * 160}ms` }} />
        ))}
        <span className="sr-only">CLARA is looking that up…</span>
      </span>
    </div>
  )
}

/** @param {Record<string, any>} props */
export default function ClaraMessageList(props) {
  const { messages, pending, onNavigate, onRetry, children = null } = props
  const scrollRef = useRef(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    container.scrollTo({ top: container.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" })
  }, [messages, pending])

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation with CLARA"
      tabIndex={0}
      className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
    >
      {messages.map((message) => <ClaraMessage key={message.id} message={message} onNavigate={onNavigate} onRetry={onRetry} />)}
      {pending && <ClaraThinking />}
      {children}
    </div>
  )
}
