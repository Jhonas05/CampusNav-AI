import { useEffect, useRef, useState } from "react"

/** True when motion is allowed (set before first paint by index.html). */
export const isMotionAllowed = () => typeof document !== "undefined" && document.documentElement.classList.contains("motion-ok")

/**
 * Reports when an element is on screen, using IntersectionObserver (no scroll
 * listeners). `once` stops observing after the first entry.
 * @param {{ once?: boolean, margin?: string, threshold?: number }} [options]
 * @returns {[import("react").MutableRefObject<any>, boolean]}
 */
export const useInView = (options = {}) => {
  const { once = true, margin = "0px 0px -8% 0px", threshold = 0.12 } = options
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting)
      if (visible) {
        setInView(true)
        if (once) observer.disconnect()
      } else if (!once) {
        setInView(false)
      }
    }, { rootMargin: margin, threshold })
    observer.observe(element)
    return () => observer.disconnect()
  }, [margin, once, threshold])

  return [ref, inView]
}

/**
 * Pointer parallax. Writes --px / --py (-1..1) on the element; children with
 * `.parallax-layer` and a `--depth` move by a few pixels. Mouse only, one
 * write per animation frame, disabled for reduced motion and touch.
 * @param {import("react").MutableRefObject<any>} ref
 */
export const usePointerParallax = (ref) => {
  useEffect(() => {
    const element = ref.current
    if (!element || !isMotionAllowed() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined
    let frame = 0
    let next = { x: 0, y: 0 }
    const apply = () => {
      frame = 0
      element.style.setProperty("--px", next.x.toFixed(3))
      element.style.setProperty("--py", next.y.toFixed(3))
    }
    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return
      const rect = element.getBoundingClientRect()
      next = {
        x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)),
        y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1)),
      }
      if (!frame) frame = window.requestAnimationFrame(apply)
    }
    const onLeave = () => {
      next = { x: 0, y: 0 }
      if (!frame) frame = window.requestAnimationFrame(apply)
    }
    element.addEventListener("pointermove", onMove, { passive: true })
    element.addEventListener("pointerleave", onLeave, { passive: true })
    return () => {
      element.removeEventListener("pointermove", onMove)
      element.removeEventListener("pointerleave", onLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [ref])
}

/** Inline style object carrying CSS custom properties. */
export const cssVars = (vars) => /** @type {import("react").CSSProperties} */ (/** @type {unknown} */ (vars))
