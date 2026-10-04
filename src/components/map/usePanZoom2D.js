import { useCallback, useEffect, useRef, useState } from "react"
import { getDefaultView, getFocusView, interpolateView, MAP2D_VIEW, panBy, resizeView, viewToTransform, zoomAt } from "@/lib/mapViewport"

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
const DRAG_THRESHOLD = 4

/**
 * Pan/zoom for the 2D SVG map: pointer drag, two-finger pinch, wheel or
 * trackpad zoom around the pointer, keyboard pan/zoom, resize handling, and
 * view requests (zoom buttons, fit, reset, facility focus). During a gesture
 * the transform is written straight to the map layer, so the map tree does
 * not re-render on every pointer move. Presentation only: no geometry,
 * route, or navigation state is read or changed here.
 *
 * `cooperative` (map previews embedded in a scrolling page) leaves plain
 * wheel scrolling and vertical one-finger swipes to the page; Ctrl/⌘ + wheel
 * or a pinch zooms the map.
 * @param {{ content: { width: number, height: number } | null, contentKey: string, defaultMode?: string, cooperative?: boolean, request?: { action: string, facilityId?: string | null, key: number } | null, getFacilityBox?: (facilityId: string) => any, enabled?: boolean }} options
 */
export default function usePanZoom2D(options) {
  const { content, contentKey, defaultMode = "fit", cooperative = false, request = null, getFacilityBox, enabled = true } = options
  const viewportRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const layerRef = useRef(/** @type {SVGGElement | null} */ (null))
  const viewRef = useRef({ scale: 1, x: 0, y: 0 })
  const sizeRef = useRef({ width: 0, height: 0 })
  const contentRef = useRef(content)
  const pendingRequestRef = useRef(null)
  const needsDefaultRef = useRef(true)
  const frameRef = useRef(0)
  const gestureRef = useRef(null)
  const pointersRef = useRef(new Map())
  const suppressClickRef = useRef(false)
  const hintTimerRef = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [hint, setHint] = useState(false)
  contentRef.current = content

  const bounds = () => ({ viewport: sizeRef.current, content: contentRef.current })
  const measured = () => sizeRef.current.width > 0 && sizeRef.current.height > 0 && Boolean(contentRef.current)

  const apply = useCallback((view) => {
    viewRef.current = view
    layerRef.current?.setAttribute("transform", viewToTransform(view))
  }, [])

  const animateTo = useCallback((target, animate = true) => {
    window.cancelAnimationFrame(frameRef.current)
    if (!animate || prefersReducedMotion()) {
      apply(target)
      return
    }
    const from = viewRef.current
    const started = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - started) / 260)
      apply(interpolateView(from, target, 1 - Math.pow(1 - t, 3)))
      if (t < 1) frameRef.current = window.requestAnimationFrame(step)
    }
    frameRef.current = window.requestAnimationFrame(step)
  }, [apply])

  const defaultView = useCallback((mode = defaultMode) => getDefaultView({ viewport: sizeRef.current, content: contentRef.current, mode }), [defaultMode])
  const center = () => ({ x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 })

  const runRequest = useCallback((next) => {
    if (!next) return
    if (!measured()) {
      pendingRequestRef.current = next
      return
    }
    const view = viewRef.current
    switch (next.action) {
      case "zoom-in":
        animateTo(zoomAt(view, MAP2D_VIEW.zoomStep, center(), bounds()))
        break
      case "zoom-out":
        animateTo(zoomAt(view, 1 / MAP2D_VIEW.zoomStep, center(), bounds()))
        break
      case "fit":
        animateTo(defaultView("fit"))
        break
      case "reset":
        animateTo(defaultView())
        break
      case "facility": {
        const box = next.facilityId ? getFacilityBox?.(next.facilityId) : null
        if (box) animateTo(getFocusView({ view, box, viewport: sizeRef.current, content: contentRef.current, minimumScale: defaultView().scale }))
        break
      }
      default:
        break
    }
  }, [animateTo, defaultView, getFacilityBox])

  // A new floor starts from its default view; a focus request for the same
  // commit (declared below) then animates from there.
  useEffect(() => {
    window.cancelAnimationFrame(frameRef.current)
    if (measured()) apply(defaultView())
    else needsDefaultRef.current = true
  }, [contentKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { runRequest(request) }, [request?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Viewport size: first measurement applies the default view; later changes
  // (fullscreen, orientation, panel layout) keep the centered map point fixed.
  useEffect(() => {
    const element = viewportRef.current
    if (!element || typeof ResizeObserver === "undefined") return undefined
    const observer = new ResizeObserver(([entry]) => {
      const next = { width: entry.contentRect.width, height: entry.contentRect.height }
      if (!next.width || !next.height) return
      const previous = sizeRef.current
      sizeRef.current = next
      if (!contentRef.current) return
      if (needsDefaultRef.current || !previous.width) {
        needsDefaultRef.current = false
        apply(defaultView())
      } else {
        apply(resizeView(viewRef.current, previous, next, contentRef.current))
      }
      if (pendingRequestRef.current) {
        const pending = pendingRequestRef.current
        pendingRequestRef.current = null
        runRequest(pending)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [apply, defaultView, runRequest])

  const showHint = useCallback(() => {
    setHint(true)
    window.clearTimeout(hintTimerRef.current)
    hintTimerRef.current = window.setTimeout(() => setHint(false), 1400)
  }, [])

  // Wheel needs a non-passive listener to keep the page from scrolling while
  // zooming; the capture-phase click listener swallows the click that ends a
  // drag so rooms are only selected by a deliberate tap/click.
  useEffect(() => {
    const element = viewportRef.current
    if (!element || !enabled) return undefined
    const onWheel = (event) => {
      if (!measured()) return
      if (cooperative && !(event.ctrlKey || event.metaKey)) {
        showHint()
        return
      }
      event.preventDefault()
      window.cancelAnimationFrame(frameRef.current)
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1
      const delta = Math.max(-240, Math.min(240, event.deltaY * unit))
      const rect = element.getBoundingClientRect()
      const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0018))
      apply(zoomAt(viewRef.current, factor, { x: event.clientX - rect.left, y: event.clientY - rect.top }, bounds()))
    }
    const onClickCapture = (event) => {
      if (!suppressClickRef.current) return
      suppressClickRef.current = false
      event.stopPropagation()
      event.preventDefault()
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    element.addEventListener("click", onClickCapture, true)
    return () => {
      element.removeEventListener("wheel", onWheel)
      element.removeEventListener("click", onClickCapture, true)
      window.clearTimeout(hintTimerRef.current)
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [apply, cooperative, enabled, showHint])

  const local = (event) => {
    const rect = viewportRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startPinch = () => {
    const [a, b] = [...pointersRef.current.values()]
    gestureRef.current = {
      type: "pinch",
      view: viewRef.current,
      distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      moved: true,
    }
  }

  const startPan = (point) => {
    gestureRef.current = { type: "pan", view: viewRef.current, origin: point, moved: false }
  }

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    if (!measured()) return
    window.cancelAnimationFrame(frameRef.current)
    pointersRef.current.set(event.pointerId, local(event))
    if (pointersRef.current.size === 1) startPan(local(event))
    else if (pointersRef.current.size === 2) {
      for (const id of pointersRef.current.keys()) viewportRef.current?.setPointerCapture?.(id)
      startPinch()
      setDragging(true)
    }
  }

  const onPointerMove = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    const point = local(event)
    pointersRef.current.set(event.pointerId, point)
    const gesture = gestureRef.current
    if (!gesture) return
    if (gesture.type === "pan") {
      const dx = point.x - gesture.origin.x
      const dy = point.y - gesture.origin.y
      if (!gesture.moved) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        // In an embedded preview a mostly vertical one-finger swipe belongs to
        // the page scroll, so the map ignores it (a pinch can still start).
        if (cooperative && event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) {
          gestureRef.current = { type: "ignored" }
          return
        }
        gesture.moved = true
        setDragging(true)
        viewportRef.current?.setPointerCapture?.(event.pointerId)
      }
      apply(panBy(gesture.view, dx, dy, bounds()))
    } else if (gesture.type === "pinch" && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const zoomed = zoomAt(gesture.view, Math.hypot(b.x - a.x, b.y - a.y) / gesture.distance, gesture.mid, bounds())
      apply(panBy(zoomed, mid.x - gesture.mid.x, mid.y - gesture.mid.y, bounds()))
    }
  }

  const endPointer = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.delete(event.pointerId)
    const gesture = gestureRef.current
    if (gesture?.moved) suppressClickRef.current = event.type === "pointerup"
    if (pointersRef.current.size === 1) {
      // Pinch → one finger: continue as a pan from the current view.
      startPan([...pointersRef.current.values()][0])
      gestureRef.current.moved = true
      return
    }
    if (pointersRef.current.size === 0) {
      gestureRef.current = null
      setDragging(false)
      // Clear a stale suppression if no click follows the drag.
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    }
  }

  const onKeyDown = (event) => {
    if (event.target !== viewportRef.current || !measured()) return
    const step = MAP2D_VIEW.keyboardPan
    const actions = {
      ArrowLeft: () => animateTo(panBy(viewRef.current, step, 0, bounds()), false),
      ArrowRight: () => animateTo(panBy(viewRef.current, -step, 0, bounds()), false),
      ArrowUp: () => animateTo(panBy(viewRef.current, 0, step, bounds()), false),
      ArrowDown: () => animateTo(panBy(viewRef.current, 0, -step, bounds()), false),
      "+": () => runRequest({ action: "zoom-in", key: 0 }),
      "=": () => runRequest({ action: "zoom-in", key: 0 }),
      "-": () => runRequest({ action: "zoom-out", key: 0 }),
      _: () => runRequest({ action: "zoom-out", key: 0 }),
      0: () => runRequest({ action: "reset", key: 0 }),
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return {
    viewportRef,
    layerRef,
    dragging,
    hint,
    transform: viewToTransform(viewRef.current),
    touchAction: cooperative ? "pan-y" : "none",
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endPointer,
      onPointerCancel: endPointer,
      onKeyDown,
    },
  }
}
