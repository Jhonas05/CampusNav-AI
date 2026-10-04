import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** @param {Record<string, any>} props */
export default function QuickAccessCard(props) {
  const { to, name, detail, icon: Icon, emphasis = false, tileClass = null } = props
  return (
    <Link
      to={to}
      className={cn(
        "interactive-card group flex min-h-[106px] flex-col justify-between rounded-2xl border bg-surface p-4",
        emphasis ? "border-[1.5px] border-ink" : "border-line",
        focusRing
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-transparent card-icon",
          emphasis ? "bg-ink text-on-ink" : tileClass || "border-line bg-subtle text-ink"
        )}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <ChevronRight className="card-arrow h-4 w-4 text-ink-ghost group-hover:text-ink" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-ink">{name}</p>
        <p className="card-badge mt-0.5 inline-block text-xs text-ink-faint">{detail}</p>
      </div>
    </Link>
  )
}
