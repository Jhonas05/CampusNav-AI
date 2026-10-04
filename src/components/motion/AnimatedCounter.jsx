import { useEffect, useRef, useState } from "react"
import { isMotionAllowed, useInView } from "./hooks"

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

/**
 * Counts from 0 to `value` once, when first scrolled into view (~700ms).
 * Later value changes update immediately. A null/undefined value renders the
 * placeholder — no number is ever invented.
 * @param {Record<string, any>} props
 */
export default function AnimatedCounter(props) {
  const { value, duration = 700, placeholder = "—", className } = props
  const numeric = typeof value === "number" && Number.isFinite(value)
  const [ref, inView] = useInView()
  const played = useRef(false)
  const [display, setDisplay] = useState(() => (numeric && isMotionAllowed() && value > 0 ? 0 : value))

  useEffect(() => {
    if (!numeric) return undefined
    if (played.current || !isMotionAllowed() || value <= 0) {
      setDisplay(value)
      return undefined
    }
    if (!inView) return undefined
    played.current = true
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(easeOut(progress) * value))
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, inView, numeric, value])

  return <span ref={ref} className={className}>{numeric ? display : placeholder}</span>
}
