import { forwardRef, useEffect, useState } from "react"
import ClaraComposer from "./ClaraComposer"
import ClaraHeader from "./ClaraHeader"
import ClaraMessageList from "./ClaraMessageList"
import ClaraSuggestionChips from "./ClaraSuggestionChips"
import { CLARA_SCOPE_NOTICE, CLARA_SUGGESTED_PROMPTS } from "@/services/claraService"

/**
 * Keeps the mobile sheet inside the visible viewport while the software
 * keyboard is open (iOS does not resize the layout viewport).
 */
const useKeyboardInset = (enabled) => {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!enabled || !viewport) return undefined
    const update = () => setInset(Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)))
    update()
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    return () => {
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
      setInset(0)
    }
  }, [enabled])
  return inset
}

/**
 * Floating CLARA conversation. A non-modal dialog: the current CampusNav page
 * stays visible and usable behind it. Desktop/tablet: a popup above the
 * trigger. Phones: a near full-width bottom sheet.
 */
const ClaraChatPanel = forwardRef(function ClaraChatPanel(/** @type {Record<string, any>} */ props, composerRef) {
  const { messages, pending, hasConversation, onSend, onRetry, onReset, onMinimize, onClose, onNavigate } = props
  const keyboardInset = useKeyboardInset(true)

  return (
    <section
      id="clara-chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="clara-title"
      aria-describedby="clara-description"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation()
          onMinimize()
        }
      }}
      style={{ "--clara-keyboard": `${keyboardInset}px` }}
      className="clara-panel-enter fixed z-clara-panel flex flex-col overflow-hidden rounded-[22px] border border-line-strong bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.08),0_24px_60px_rgba(0,0,0,0.18)] max-sm:inset-x-3 max-sm:bottom-[calc(0.75rem+var(--clara-keyboard,0px))] max-sm:h-[min(42rem,calc(86dvh-var(--clara-keyboard,0px)))] sm:bottom-[calc(1.5rem+3.5rem+0.75rem+env(safe-area-inset-bottom)+var(--clara-lift,0px))] sm:right-6 sm:h-[min(38rem,calc(100dvh-7.5rem-var(--clara-lift,0px)))] sm:max-h-[80dvh] sm:w-[25rem] print:hidden"
    >
      <ClaraHeader titleId="clara-title" descriptionId="clara-description" canReset={hasConversation} onReset={onReset} onMinimize={onMinimize} onClose={onClose} />
      <ClaraMessageList messages={messages} pending={pending} onNavigate={onNavigate} onRetry={onRetry}>
        {!hasConversation && <ClaraSuggestionChips prompts={CLARA_SUGGESTED_PROMPTS} onSelect={onSend} disabled={pending} />}
      </ClaraMessageList>
      <ClaraComposer ref={composerRef} onSend={onSend} pending={pending} notice={CLARA_SCOPE_NOTICE} />
    </section>
  )
})

export default ClaraChatPanel
