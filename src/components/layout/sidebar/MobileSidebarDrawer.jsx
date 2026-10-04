import * as Dialog from "@radix-ui/react-dialog"
import { useRef } from "react"
import { SidebarNavigation } from "./Sidebar"

/**
 * Mobile navigation: a left slide-out drawer. Radix Dialog provides the focus
 * trap, Escape-to-close, scroll lock, and overlay dismissal.
 * @param {Record<string, any>} props
 */
export default function MobileSidebarDrawer(props) {
  const { open, onOpenChange, ...rest } = props
  const close = () => onOpenChange(false)
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
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-200 md:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={rememberOpener}
          onCloseAutoFocus={restoreOpener}
          className="fixed inset-y-0 left-0 z-overlay w-[min(19rem,86vw)] rounded-r-[22px] border-r border-line bg-canvas-raised pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[0_24px_60px_rgba(0,0,0,0.2)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:duration-200 data-[state=open]:duration-200 md:hidden"
        >
          <Dialog.Title className="sr-only">CampusNav navigation</Dialog.Title>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
