import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { askClara, CLARA_WELCOME_MESSAGE, getClaraFacilityContextReply } from "@/services/claraService"

/**
 * Global CLARA assistant state. One provider lives in the app shell so the
 * floating button, the chat panel, and every "Ask CLARA" call-to-action share
 * the same conversation. State is in memory only: it survives route changes
 * but is never written to browser storage.
 */

/** @typedef {{ id: number, role: "user" | "assistant", text: string, facility?: any, link?: { href: string, label: string } | null, verified?: boolean, error?: boolean, retryText?: string }} ClaraMessage */

const noop = () => {}

const defaultValue = {
  available: false,
  open: false,
  minimized: false,
  pending: false,
  messages: /** @type {ClaraMessage[]} */ ([]),
  hasConversation: false,
  /** @type {(request?: { question?: string | null, facilityId?: string | null }) => void} */
  openClara: noop,
  /** @type {(text: string) => void} */
  send: noop,
  minimize: noop,
  close: noop,
  reset: noop,
  /** @type {(text: string) => void} */
  retry: noop,
}

const ClaraContext = createContext(defaultValue)

const welcomeMessage = () => ({ id: 0, role: /** @type {"assistant"} */ ("assistant"), text: CLARA_WELCOME_MESSAGE, facility: null, link: null, verified: true })

export function ClaraProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [messages, setMessages] = useState(() => /** @type {ClaraMessage[]} */ ([welcomeMessage()]))
  const nextId = useRef(1)
  const requestToken = useRef(0)

  const append = useCallback((message) => {
    setMessages((current) => [...current, { ...message, id: nextId.current++ }])
  }, [])

  const request = useCallback(async (text) => {
    const token = ++requestToken.current
    setPending(true)
    try {
      const reply = await askClara(text)
      if (token !== requestToken.current) return
      if (!reply?.text) {
        append({ role: "assistant", text: "CLARA returned no response for that request.", error: true, retryText: text })
      } else {
        append({ role: "assistant", ...reply })
      }
    } catch {
      if (token !== requestToken.current) return
      const offline = typeof navigator !== "undefined" && navigator.onLine === false
      append({
        role: "assistant",
        text: offline ? "You appear to be offline. CLARA could not be reached." : "CLARA could not answer right now. Campus data is temporarily unavailable.",
        error: true,
        retryText: text,
      })
    } finally {
      if (token === requestToken.current) setPending(false)
    }
  }, [append])

  const send = useCallback((value) => {
    const text = String(value || "").trim()
    if (!text) return
    append({ role: "user", text })
    request(text)
  }, [append, request])

  const retry = useCallback((text) => {
    setMessages((current) => current.filter((message) => !(message.error && message.retryText === text)))
    request(text)
  }, [request])

  const openClara = useCallback((options = {}) => {
    const { question = null, facilityId = null } = options
    setOpen(true)
    if (facilityId) {
      const reply = getClaraFacilityContextReply(facilityId)
      if (reply) {
        append({ role: "user", text: `Tell me about ${reply.facility.name}.` })
        append({ role: "assistant", ...reply })
        return
      }
    }
    if (question) send(question)
  }, [append, send])

  const minimize = useCallback(() => setOpen(false), [])

  const reset = useCallback(() => {
    requestToken.current += 1
    setPending(false)
    nextId.current = 1
    setMessages([welcomeMessage()])
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    reset()
  }, [reset])

  const value = useMemo(() => ({
    available: true,
    open,
    minimized: !open && messages.length > 1,
    pending,
    messages,
    hasConversation: messages.length > 1,
    openClara,
    send,
    minimize,
    close,
    reset,
    retry,
  }), [close, messages, minimize, open, openClara, pending, reset, retry, send])

  return <ClaraContext.Provider value={value}>{children}</ClaraContext.Provider>
}

export const useClara = () => useContext(ClaraContext)
