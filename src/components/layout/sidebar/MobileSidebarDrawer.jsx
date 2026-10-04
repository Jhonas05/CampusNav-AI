import * as Dialog from "@radix-ui/react-dialog"
import { useEffect, useRef } from "react"
import { SidebarNavigation } from "./Sidebar"
import { cn } from "@/lib/utils"

const HIDE_FROM = { md: "md:hidden", lg: "lg:hidden" }
const SIDEBAR_QUERY = { md: "(min-width: 768px)", lg: "(min-width: 1024px)" }

/**
 * Mobile navigation: a left slide-out drawer. Radix Dialog provides the focus
 * trap, Escape-to-close, scroll lock, and overlay dismissal. It shows the
 * global navigation by default; the Admin shell passes its own navigation as
 * a render function (`children({ close })`) and a later breakpoint.
 * @param {Record<string, any>} props
 */
export default function MobileSidebarDrawer(props) {
  const { open, onOpenChange, title = "CampusNav navigation", hideFrom = "md", children = null, ...rest } = props
  const hidden = HIDE_FROM[hideFrom] || HIDE_FROM.md
  const close = () => onOpenChange(false)

  // The drawer is hidden by CSS once the sidebar takes over. Close it then, or
  // the open dialog would keep the page scroll-locked and hidden from assistive tech.
  useEffect(() => {
    if (!open) return undefined
    const query = window.matchMedia(SIDEBAR_QUERY[hideFrom] || SIDEBAR_QUERY.md)
    const closeWhenSidebarShows = () => { if (query.matches) onOpenChange(false) }
    closeWhenSidebarShows()
    query.addEventListener("change", closeWhenSidebarShows)
    return () => query.removeEventListener("change", closeWhenSidebarShows)
  }, [hideFrom, onOpenChange, open])
  // Radix restores focus only to a Dialog.Trigger; the drawer is opened from
  // the mobile context bar, so remember that control and return focus to it.
  const returnFocusRef = useRef(/** @type {HTMLElement | null} */ (null))
  const rememberOpener = () => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }
  const restoreOpener = (event) => {
    const opener = returnFocusRef.current
    returnFocusRef.current = null
    const focusLost = !document.activeElement || document.activeElement === document.body
    if (opener?.isConnected && focusLost) {
      event.preventDefault()
      opener.focus({ preventScroll: true })
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn("fixed inset-0 z-overlay bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-200", hidden)} />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={rememberOpener}
          onCloseAutoFocus={restoreOpener}
          className={cn("fixed inset-y-0 left-0 z-overlay w-[min(19rem,86vw)] rounded-r-[22px] border-r border-line bg-canvas-raised pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[0_24px_60px_rgba(0,0,0,0.2)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:duration-200 data-[state=open]:duration-200", hidden)}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {typeof children === "function" ? children({ close }) : (
            <SidebarNavigation
              {...rest}
              collapsed={false}
              onNavigate={close}
              onClose={close}
              onSearch={() => { close(); rest.onSearch?.() }}
              onToggleNotifications={() => { close(); rest.onToggleNotifications?.() }}
              onToggleProfile={() => { close(); rest.onToggleProfile?.() }}
              onToggleCollapse={null}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
