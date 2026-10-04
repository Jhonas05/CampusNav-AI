import { ArrowUp } from "lucide-react"
import { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Chat composer. Enter sends, Shift+Enter inserts a new line.
 */
const ClaraComposer = forwardRef(function ClaraComposer(/** @type {Record<string, any>} */ props, ref) {
  const { onSend, pending = false, notice = null } = props
  const [value, setValue] = useState("")

  const submit = () => {
    const text = value.trim()
    if (!text || pending) return
    onSend(text)
    setValue("")
    if (ref && typeof ref === "object" && ref.current) ref.current.style.height = ""
  }

  return (
    <div className="shrink-0 border-t border-line bg-surface px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3 sm:pb-2.5">
      <form
        onSubmit={(event) => { event.preventDefault(); submit() }}
        className="flex items-end gap-2 rounded-[20px] border border-line-strong bg-fill py-1.5 pl-4 pr-1.5 transition-colors duration-200 focus-within:border-ink focus-within:bg-surface"
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            // Grow with the text in browsers without `field-sizing: content`.
            const field = event.target
            field.style.height = "auto"
            field.style.height = `${Math.min(field.scrollHeight, 112)}px`
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Ask CLARA about the campus..."
          aria-label="Message CLARA"
          className="max-h-28 min-h-9 min-w-0 flex-1 resize-none self-center bg-transparent py-1.5 text-[15px] leading-snug text-ink outline-none [field-sizing:content] placeholder:text-ink-faint sm:text-sm"
        />
        <button
          type="submit"
          disabled={!value.trim() || pending}
          aria-label="Send message"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink transition-[background-color,transform,opacity] duration-200 hover:bg-ink-strong active:scale-95 disabled:opacity-25 motion-reduce:transform-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          )}
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
      {notice && <p className="mt-2 px-1 text-center text-[10px] leading-relaxed text-ink-faint">{notice}</p>}
    </div>
  )
})

export default ClaraComposer
