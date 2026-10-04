import { forwardRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Card surface with the shared hover response: 3px lift, stronger border,
 * and a nudge on any child marked `card-arrow`, `card-icon`, or `card-badge`.
 * Renders as any element (`as={Link}`, `"button"`, ...).
 */
const InteractiveCard = forwardRef(function InteractiveCard(/** @type {Record<string, any>} */ props, ref) {
  const { as: Element = "div", className, children, ...rest } = props
  return (
    <Element
      ref={ref}
      className={cn(
        "interactive-card group relative block rounded-[18px] border border-line bg-surface text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
        className
      )}
      {...rest}
    >
      {children}
    </Element>
  )
})

export default InteractiveCard
