import * as Dialog from "@radix-ui/react-dialog"
import useResponsiveDialog from "../useResponsiveDialog"
import { cn } from "@/lib/utils"

/**
 * Left slide-out drawer for the Admin menu below 1024px. Radix Dialog
 * provides the focus trap, Escape-to-close, scroll lock, and overlay
 * dismissal. The navigation is passed as a render function
 * (`children({ close })`). Public pages do not use a drawer: phones get the
 * bottom navigation and its More sheet.
 * @param {Record<string, any>} props
 */
export default function MobileSidebarDrawer(props) {
  const { open, onOpenChange, title, hideFrom = "lg", children } = props
  const { hiddenClass, onOpenAutoFocus, onCloseAutoFocus } = useResponsiveDialog({ open, onOpenChange, hideFrom })
  const close = () => onOpenChange(false)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn("fixed inset-0 z-overlay bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-200", hiddenClass)} />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn("fixed inset-y-0 left-0 z-overlay w-[min(19rem,86vw)] rounded-r-[22px] border-r border-line bg-canvas-raised pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[0_24px_60px_rgba(0,0,0,0.2)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-[state=closed]:duration-200 data-[state=open]:duration-200", hiddenClass)}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {children({ close })}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
