import { useEffect, useRef } from "react"

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard behavior for CampusNav's custom modal dialogs: move focus into the
 * dialog when it opens, keep Tab inside it, close on Escape, and return focus
 * to the control that opened it. Attach the returned ref to the dialog element.
 * @param {{ active?: boolean, onClose?: (() => void) | null }} [options]
 */
export default function useModalDialog(options = {}) {
  const { active = true, onClose = null } = options
  const ref = useRef(/** @type {HTMLElement | null} */ (null))
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = ref.current
    if (!active || !dialog) return undefined
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusables = () => Array.from(dialog.querySelectorAll(FOCUSABLE)).filter((element) => element instanceof HTMLElement && element.offsetParent !== null)
    if (!dialog.contains(document.activeElement)) {
      const first = focusables()[0]
      if (first instanceof HTMLElement) first.focus({ preventScroll: true })
      else {
        dialog.setAttribute("tabindex", "-1")
        dialog.focus({ preventScroll: true })
      }
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape" && onCloseRef.current) {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== "Tab") return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        if (last instanceof HTMLElement) last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        if (first instanceof HTMLElement) first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown, true)
    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      if (previous && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [active])

  return ref
}
