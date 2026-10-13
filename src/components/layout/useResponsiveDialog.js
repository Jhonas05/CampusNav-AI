import { useEffect, useRef } from "react"

const HIDE_FROM = { md: "md:hidden", lg: "lg:hidden" }
const QUERY = { md: "(min-width: 768px)", lg: "(min-width: 1024px)" }

/**
 * Shared behaviour for the small-screen Radix dialogs (the Admin menu drawer
 * and the phone bottom sheets), which are opened from a control that is not a
 * `Dialog.Trigger`:
 * - closes the dialog once the window grows past its breakpoint, or the open
 *   dialog would keep the page scroll-locked and hidden from assistive tech;
 * - remembers the opener and returns focus to it on close.
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void, hideFrom?: "md" | "lg" }} options
 */
export default function useResponsiveDialog({ open, onOpenChange, hideFrom = "md" }) {
  useEffect(() => {
    if (!open) return undefined
    const query = window.matchMedia(QUERY[hideFrom] || QUERY.md)
    const closeWhenHidden = () => { if (query.matches) onOpenChange(false) }
    closeWhenHidden()
    query.addEventListener("change", closeWhenHidden)
    return () => query.removeEventListener("change", closeWhenHidden)
  }, [hideFrom, onOpenChange, open])

  const returnFocusRef = useRef(/** @type {HTMLElement | null} */ (null))
  const onOpenAutoFocus = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  const onCloseAutoFocus = (event) => {
    const opener = returnFocusRef.current
    returnFocusRef.current = null
    const focusLost = !document.activeElement || document.activeElement === document.body
    if (opener?.isConnected && focusLost) {
      event.preventDefault()
      opener.focus({ preventScroll: true })
    }
  }

  return { hiddenClass: HIDE_FROM[hideFrom] || HIDE_FROM.md, onOpenAutoFocus, onCloseAutoFocus }
}
