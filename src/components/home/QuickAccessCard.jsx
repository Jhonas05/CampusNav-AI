import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cardHover, focusRing } from "@/components/campus/ui"
import { cn } from "@/lib/utils"

/** @param {Record<string, any>} props */
export default function QuickAccessCard(props) {
  const { to, name, detail, icon: Icon, emphasis = false, tileClass = null } = props
  return (
    <Link
      to={to}
      className={cn(
        "group flex min-h-[106px] flex-col justify-between rounded-2xl border bg-white p-4",
        emphasis ? "border-[1.5px] border-red-700" : "border-[#E5E5E7]",
        cardHover,
        focusRing
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none",
          emphasis ? "bg-red-700 text-white" : tileClass || "border-[#E5E5E7] bg-[#FAFAFA] text-[#1D1D1F]"
        )}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <ChevronRight className="h-4 w-4 text-[#D2D2D7] transition-colors duration-200 group-hover:text-brand-700" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-[#1D1D1F]">{name}</p>
        <p className="mt-0.5 text-xs text-[#86868B]">{detail}</p>
      </div>
    </Link>
  )
}
