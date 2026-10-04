import { useInView } from "./hooks"
import { cn } from "@/lib/utils"

/**
 * Reveals its content once (fade + 12px rise) when it scrolls into view.
 * With reduced motion the content is simply shown.
 * @param {Record<string, any>} props
 */
export default function MotionReveal(props) {
  const { as: Element = "div", index = 0, className, style, children, ...rest } = props
  const [ref, inView] = useInView()
  return (
    <Element ref={ref} data-inview={inView ? "true" : undefined} className={cn("motion-reveal", className)} style={{ ...style, "--reveal-index": index }} {...rest}>
      {children}
    </Element>
  )
}

/**
 * Reveals its direct children with a 60ms stagger when the group scrolls
 * into view. One observer for the whole group.
 * @param {Record<string, any>} props
 */
export function StaggerGroup(props) {
  const { as: Element = "div", className, children, ...rest } = props
  const [ref, inView] = useInView()
  return (
    <Element ref={ref} data-inview={inView ? "true" : undefined} className={cn("motion-stagger", className)} {...rest}>
      {children}
    </Element>
  )
}
