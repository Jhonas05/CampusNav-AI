import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import ClaraChatPanel from "./ClaraChatPanel"
import { useClara } from "./ClaraContext"
import ClaraFloatingButton from "./ClaraFloatingButton"

/**
 * Global CLARA assistant: one floating trigger and one chat panel, mounted
 * once by the app shell. Every "Ask CLARA" action in the app opens this same
 * instance through `useClara().openClara()`.
 */
export default function ClaraAssistant() {
  const clara = useClara()
  const location = useLocation()
  const triggerRef = useRef(null)
  const composerRef = useRef(null)
  const returnFocusRef = useRef(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (clara.open && !wasOpen.current) {
      const active = document.activeElement
      returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null
      const frame = window.requestAnimationFrame(() => composerRef.current?.focus({ preventScroll: true }))
      wasOpen.current = true
      return () => window.cancelAnimationFrame(frame)
    }
    if (!clara.open && wasOpen.current) {
      wasOpen.current = false
      const target = returnFocusRef.current
      if (target && target.isConnected && target.offsetParent !== null) target.focus({ preventScroll: true })
      else triggerRef.current?.focus({ preventScroll: true })
    }
    return undefined
  }, [clara.open])

  return (
    <>
      {clara.open && (
        <ClaraChatPanel
          ref={composerRef}
          messages={clara.messages}
          pending={clara.pending}
          hasConversation={clara.hasConversation}
          onSend={clara.send}
          onRetry={clara.retry}
          onReset={() => { clara.reset(); composerRef.current?.focus() }}
          onMinimize={clara.minimize}
          onClose={clara.close}
          onNavigate={clara.minimize}
        />
      )}
      <ClaraFloatingButton
        ref={triggerRef}
        open={clara.open}
        hasConversation={clara.hasConversation}
        compact={location.pathname === "/map"}
        onClick={() => (clara.open ? clara.minimize() : clara.openClara())}
      />
    </>
  )
}
