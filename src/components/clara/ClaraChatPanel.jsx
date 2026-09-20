import { ArrowRight, ArrowUp, Clock3, MapPin, MessageCircle, RotateCcw, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { focusRing } from "@/components/campus/ui"
import FacilityStatusBadge from "@/components/facilities/FacilityStatusBadge"
import { useClara } from "@/contexts/ClaraContext"
import { FACILITY_DATA_NOTICE } from "@/data/facilities"
import { getFloorById } from "@/data/floors"
import { SUGGESTED_PROMPTS } from "@/lib/claraEngine"
import { getFacilityNavigationHref } from "@/services/dashboardService"
import { cn } from "@/lib/utils"

/**
 * Result card for a matched facility.
 *
 * Actions hand off to the existing CampusNav surfaces — routing stays with
 * the campus route engine, CLARA only points at it.
 */
function FacilityResultCard({ facility }) {
  const floor = getFloorById(facility.floorId)
  const navigationHref = getFacilityNavigationHref(facility.id)
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#D2D2D7] bg-white">
      <div className="p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8E8E93]">{facility.kind}</p>
        <p className="mt-1 text-[15px] font-semibold tracking-tight text-[#1D1D1F]">{facility.name}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6E6E73]">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {floor?.name || facility.floorId}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FacilityStatusBadge size="sm" />
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#AEAEB2] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6E6E73]">
            <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours pending
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-[#E3E3E6] bg-[#FAFAFA] p-3">
        {navigationHref && (
          <Link
            to={navigationHref}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#1D1D1F] px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-black",
              focusRing
            )}
          >
            Navigate There <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        <Link
          to={`/facilities/${facility.id}`}
          className={cn(
            "inline-flex min-h-9 items-center rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#8E8E93]",
            focusRing
          )}
        >
          {facility.kind === "Office" ? "View Office" : "View Details"}
        </Link>
      </div>
    </div>
  )
}

/**
 * Floating CLARA conversation.
 *
 * Desktop and tablet: an anchored panel above the floating button. Phones: a
 * near-fullscreen bottom sheet with an explicit close control, because a
 * 380px desktop panel is unusable at that width. The transcript itself lives
 * in ClaraContext, so closing the panel or changing page keeps it intact.
 */
export default function ClaraChatPanel() {
  const { open, closeClara, messages, ask, clear } = useClara()
  const [input, setInput] = useState("")
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    previouslyFocused.current = document.activeElement
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeClara()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.cancelAnimationFrame(frame)
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
    }
  }, [open, closeClara])

  useEffect(() => {
    if (!open) return
    const container = scrollRef.current
    if (!container) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    container.scrollTo({ top: container.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" })
  }, [messages, open])

  if (!open) return null

  const submit = (event) => {
    event.preventDefault()
    ask(input)
    setInput("")
  }

  const showSuggestions = messages.filter((message) => message.role === "user").length < 2

  return (
    <>
      {/* Phone-only scrim. The panel never blocks the app on larger screens. */}
      <div
        aria-hidden="true"
        onMouseDown={closeClara}
        className="fixed inset-0 z-[58] bg-[#1D1D1F]/35 backdrop-blur-sm animate-overlay-in motion-reduce:animate-none sm:hidden"
      />

      <div
        id="clara-chat-panel"
        role="dialog"
        aria-modal="false"
        aria-label="CLARA — Campus Learning Alerts and Response Assistant"
        style={{ boxShadow: "0 24px 64px rgba(29, 29, 31, 0.22)" }}
        className={cn(
          "fixed z-[59] flex flex-col overflow-hidden border border-[#D2D2D7] bg-white",
          // Phone: near-fullscreen bottom sheet.
          "inset-x-0 bottom-0 top-[max(3rem,env(safe-area-inset-top))] rounded-t-3xl animate-sheet-up",
          // Tablet and up: anchored panel above the floating button.
          "sm:inset-x-auto sm:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:right-7 sm:top-auto sm:h-[min(38rem,calc(100dvh-9rem))] sm:w-[min(24rem,calc(100vw-3.5rem))] sm:rounded-2xl sm:animate-panel-in",
          "lg:w-[24rem]",
          "motion-reduce:animate-none"
        )}
      >
        <header className="flex items-start gap-3 border-b border-[#E3E3E6] px-4 py-3.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1D1D1F] text-white"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold uppercase leading-none tracking-[0.04em] text-[#1D1D1F]">CLARA</p>
            <p className="mt-1 truncate text-[11px] text-[#6E6E73]">Campus Digital Concierge</p>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="Clear conversation"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6E6E73] transition-colors duration-200 hover:bg-[#F0F0F2] hover:text-[#1D1D1F]",
              focusRing
            )}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={closeClara}
            aria-label="Close CLARA"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6E6E73] transition-colors duration-200 hover:bg-[#F0F0F2] hover:text-[#1D1D1F]",
              focusRing
            )}
          >
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </header>

        <div
          ref={scrollRef}
          aria-live="polite"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex gap-2.5", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#D2D2D7] bg-[#F5F5F7] text-[#1D1D1F]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
              )}
              <div
                className={cn(
                  "max-w-[85%]",
                  message.role === "user" && "rounded-2xl rounded-br-md bg-[#1D1D1F] px-3.5 py-2.5 text-white"
                )}
              >
                {message.role === "assistant" ? (
                  <>
                    <div className="rounded-2xl rounded-tl-md border border-[#E3E3E6] bg-[#F5F5F7] px-3.5 py-2.5">
                      <p className="text-[13px] leading-relaxed text-[#1D1D1F]">{message.text}</p>
                    </div>
                    {message.facility && <FacilityResultCard facility={message.facility} />}
                    {message.link && (
                      <Link
                        to={message.link.href}
                        onClick={closeClara}
                        className={cn(
                          "mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-4 text-xs font-semibold text-[#1D1D1F] transition-colors duration-200 hover:border-[#8E8E93]",
                          focusRing
                        )}
                      >
                        {message.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] leading-relaxed">{message.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E3E3E6] p-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          {showSuggestions && (
            <div
              role="group"
              aria-label="Suggested questions"
              className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => ask(prompt)}
                  className={cn(
                    "shrink-0 rounded-full border border-[#D2D2D7] bg-white px-3.5 py-2 text-[11px] font-medium text-[#48484A] transition-colors duration-200 hover:border-[#1D1D1F] hover:text-[#1D1D1F]",
                    focusRing
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={submit}
            className="flex items-center gap-2 rounded-full border border-[#D2D2D7] bg-[#F5F5F7] p-1.5 pl-4 transition-colors duration-200 focus-within:border-[#1D1D1F]"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask CLARA..."
              aria-label="Ask CLARA"
              className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-[#1D1D1F] outline-none placeholder:text-[#8E8E93]"
            />
            <button
              type="submit"
              aria-label="Send message"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D1D1F] text-white transition-colors duration-200 hover:bg-black",
                focusRing
              )}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-2.5 text-center text-[10px] leading-relaxed text-[#8E8E93]">{FACILITY_DATA_NOTICE}</p>
        </div>
      </div>
    </>
  )
}
