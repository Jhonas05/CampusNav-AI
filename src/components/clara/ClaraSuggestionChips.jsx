import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** @param {Record<string, any>} props */
export default function ClaraSuggestionChips(props) {
  const { prompts, onSelect, disabled = false } = props
  return (
    <div role="group" aria-label="Suggested questions" className="flex flex-wrap gap-2 pl-[2.375rem]">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className={cn("min-h-9 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-left text-[13px] font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-fill disabled:opacity-40", focusRing)}
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
