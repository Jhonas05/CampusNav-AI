import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { buildReply, createWelcomeMessage, facilityReply } from "@/lib/claraEngine"

/**
 * Holds the CLARA conversation for the whole session.
 *
 * The provider sits above the router outlet so switching CampusNav pages or
 * closing the panel never resets the transcript — only an explicit "Clear
 * conversation" does.
 */
const ClaraContext = createContext({
  open: false,
  messages: [],
  openClara: () => {},
  closeClara: () => {},
  toggleClara: () => {},
  ask: (/** @type {string} */ _question) => {},
  askAbout: (/** @type {any} */ _facility) => {},
  clear: () => {},
})

export function ClaraProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [createWelcomeMessage()])

  const ask = useCallback((value) => {
    const trimmed = String(value || "").trim()
    if (!trimmed) return
    const response = buildReply(trimmed)
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed, facility: null, link: null },
      { role: "assistant", ...response },
    ])
  }, [])

  /** Opens CLARA already answering about a verified facility (`?about=`). */
  const askAbout = useCallback((facility) => {
    if (!facility) return
    setMessages((current) => [
      ...current,
      { role: "assistant", text: facilityReply(facility), facility, link: null },
    ])
  }, [])

  const openClara = useCallback(() => setOpen(true), [])
  const closeClara = useCallback(() => setOpen(false), [])
  const toggleClara = useCallback(() => setOpen((current) => !current), [])
  const clear = useCallback(() => setMessages([createWelcomeMessage()]), [])

  const value = useMemo(
    () => ({ open, messages, openClara, closeClara, toggleClara, ask, askAbout, clear }),
    [open, messages, openClara, closeClara, toggleClara, ask, askAbout, clear]
  )

  return <ClaraContext.Provider value={value}>{children}</ClaraContext.Provider>
}

export const useClara = () => useContext(ClaraContext)
