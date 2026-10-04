import { Monitor, Moon, Sun } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor, description: "Use system setting" },
]

const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1"

/**
 * Appearance control. Expanded: a compact Light / Dark / System segmented
 * control. Compact (icon rail): one button that cycles through the three.
 * @param {Record<string, any>} props
 */
export default function ThemeToggle(props) {
  const { compact = false, className } = props
  const { preference, setPreference } = useTheme()
  const current = OPTIONS.find((option) => option.value === preference) || OPTIONS[2]

  if (compact) {
    const next = OPTIONS[(OPTIONS.indexOf(current) + 1) % OPTIONS.length]
    const CurrentIcon = current.icon
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setPreference(next.value)}
            aria-label={`Appearance: ${current.label}. Switch to ${next.label}.`}
            className={cn("group flex min-h-11 w-full items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 hover:bg-fill hover:text-ink", ring, className)}
          >
            <CurrentIcon className="h-[18px] w-[18px] transition-transform duration-200 ease-campus group-hover:rotate-12 motion-reduce:transform-none" strokeWidth={1.9} aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="z-overlay rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-on-ink">Appearance: {current.label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div role="radiogroup" aria-label="Appearance" className={cn("grid grid-cols-3 gap-0.5 rounded-xl bg-fill p-0.5", className)}>
      {OPTIONS.map(({ value, label, icon: Icon, description }) => {
        const selected = preference === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={description || `${label} theme`}
            title={description || `${label} theme`}
            onClick={() => setPreference(value)}
            className={cn(
              "flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] text-[12px] font-medium transition-[background-color,color,box-shadow] duration-150",
              selected ? "bg-surface text-ink shadow-soft" : "text-ink-soft hover:text-ink",
              ring
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
