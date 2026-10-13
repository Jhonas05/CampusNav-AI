import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import useResponsiveDialog from "./useResponsiveDialog"
import { cn } from "@/lib/utils"

/**
 * Phone bottom sheet for contextual, one-tap-away content (More navigation,
 * filters). A modal Radix Dialog: focus is trapped, Escape and the overlay
 * close it, and focus returns to the control that opened it. Sheets are never
 * opened from inside another sheet.
 * @param {Record<string, any>} props
 */
export default function MobileBottomSheet(props) {
  const { open, onOpenChange, title, hideFrom = "md", children, className } = props
  const { hiddenClass, onOpenAutoFocus, onCloseAutoFocus } = useResponsiveDialog({ open, onOpenChange, hideFrom })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn("fixed inset-0 z-overlay bg-black/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-200", hiddenClass)} />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "fixed inset-x-0 bottom-0 z-overlay flex max-h-[85dvh] flex-col rounded-t-[22px] border-t border-line bg-canvas-raised pb-[env(safe-area-inset-bottom)] shadow-[0_-16px_48px_rgba(0,0,0,0.18)] outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-200 data-[state=open]:duration-200 motion-reduce:animate-none",
            hiddenClass,
            className,
          )}
        >
          <span aria-hidden="true" className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong" />
          <div className="flex shrink-0 items-center justify-between gap-3 pl-5 pr-3 pt-2">
            <Dialog.Title className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</Dialog.Title>
            <Dialog.Close aria-label={`Close ${title}`} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-fill hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
