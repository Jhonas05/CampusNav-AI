import * as Dialog from "@radix-ui/react-dialog"
import { SlidersHorizontal, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import { ROUTE_PREFERENCE, ROUTE_PREFERENCE_FAILURE } from "@/lib/routePreferences"
import { cn } from "@/lib/utils"

export const routePreferenceLabel = (preference) =>
  preference === ROUTE_PREFERENCE.AVOID_STAIRS ? "Avoid Stairs" : "Standard"

/** @param {Record<string, any>} props */
export function RoutePreferenceButton({ preference, onClick, expanded = false, className = "" }) {
  return (
    <button type="button" data-route-preferences-trigger aria-haspopup="dialog" aria-expanded={expanded}
      aria-label={`Route Preferences: ${routePreferenceLabel(preference)}`} onClick={onClick}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-[13px] font-semibold text-ink hover:bg-fill", focusRing, className)}>
      <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>Route Preferences <span className="font-normal text-ink-soft">· {routePreferenceLabel(preference)}</span></span>
    </button>
  )
}

/** @param {Record<string, any>} props */
export function RoutePreferenceOptions({ preference, onChange }) {
  const groupId = useId()
  return (
    <fieldset role="radiogroup" aria-label="Route preference" className="min-w-0 space-y-2">
      <legend className="sr-only">Route preference</legend>
      {[
        { value: ROUTE_PREFERENCE.STANDARD, label: "Standard", description: "Use the usual walkable route. Stairs may be included." },
        { value: ROUTE_PREFERENCE.AVOID_STAIRS, label: "Avoid Stairs", description: "Exclude stairs. A route may be unavailable between floors." },
      ].map((choice) => (
        <label key={choice.value} className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm text-ink", preference === choice.value ? "border-ink bg-fill" : "border-line hover:bg-fill")}>
          <input type="radio" name={groupId} value={choice.value} checked={preference === choice.value}
            onChange={() => onChange(choice.value)} aria-labelledby={`${groupId}-${choice.value}-label`} aria-describedby={`${groupId}-${choice.value}`}
            className={cn("mt-0.5 h-4 w-4 shrink-0 accent-ink", focusRing)} />
          <span className="min-w-0"><span id={`${groupId}-${choice.value}-label`} className="block font-semibold">{choice.label}</span>
            <span id={`${groupId}-${choice.value}`} className="mt-1 block text-xs leading-relaxed text-ink-soft">{choice.description}</span>
          </span>
        </label>
      ))}
      <div aria-disabled="true" className="rounded-xl border border-dashed border-line-strong px-3 py-3 text-sm text-ink-soft">
        <p className="font-semibold">Step-free / Wheelchair <span className="font-normal">· Unavailable</span></p>
        <p className="mt-1 text-xs leading-relaxed">Accessibility information pending verification.</p>
      </div>
    </fieldset>
  )
}

/** Uses the same Radix modal architecture as the existing phone bottom sheets. */
export function RoutePreferencesDialog({ open, onOpenChange, preference, onApply, returnFocus = null, container = undefined }) {
  const [draft, setDraft] = useState(preference)
  const opener = useRef(/** @type {HTMLElement | null} */ (null))
  useEffect(() => {
    if (!open) return undefined
    document.documentElement.dataset.routePreferencesOpen = "true"
    return () => { delete document.documentElement.dataset.routePreferencesOpen }
  }, [open])
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-black/35 backdrop-blur-[2px]" />
        <Dialog.Content aria-describedby="route-preferences-description"
          onOpenAutoFocus={(event) => {
            opener.current = returnFocus || (document.activeElement instanceof HTMLElement ? document.activeElement : null)
            event.preventDefault()
            const selected = event.currentTarget instanceof HTMLElement ? event.currentTarget.querySelector('input:checked') : null
            if (selected instanceof HTMLElement) selected.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const target = opener.current
            const visible = target?.isConnected && target.getClientRects().length && getComputedStyle(target).visibility !== "hidden"
            if (visible) target.focus({ preventScroll: true })
            else {
              const fallback = Array.from(document.querySelectorAll('[data-route-preferences-trigger], [data-route-preferences-desktop] summary'))
                .find((element) => element.getClientRects().length > 0)
              if (fallback instanceof HTMLElement) fallback.focus()
            }
          }}
          className="fixed inset-x-0 bottom-0 z-modal max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-[22px] border border-line bg-canvas-raised p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-soft outline-none lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[25rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-ink">Route Preferences</Dialog.Title>
            <Dialog.Close aria-label="Close Route Preferences" className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-fill", focusRing)}>
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description id="route-preferences-description" className="mb-4 text-sm leading-relaxed text-ink-soft">Choose how to plan this route. Applying a change replaces any current route from your confirmed location.</Dialog.Description>
          <RoutePreferenceOptions preference={draft} onChange={setDraft} />
          <button type="button" onClick={() => { onOpenChange(false); onApply(draft) }} className={cn(button.primary, "mt-4 min-h-12 w-full")}>Apply preference</button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** @param {Record<string, any>} props */
export function RouteFailureNotice({ message, failure, onChooseStandard, className = "" }) {
  const avoidStairsFailure = failure?.code === ROUTE_PREFERENCE_FAILURE.NO_AVOID_STAIRS_ROUTE
  return (
    <div className={cn("rounded-xl border border-ink bg-fill p-3 text-sm text-ink", className)}>
      <p role="alert" aria-atomic="true" className="font-medium">{message}{avoidStairsFailure && <span className="mt-1 block font-normal">CampusNav will not automatically switch to a route that uses stairs.</span>}</p>
      {avoidStairsFailure && <button type="button" onClick={onChooseStandard} className={cn(button.secondary, "mt-2 min-h-11 w-full")}>Choose Standard Route</button>}
    </div>
  )
}
