import { useCallback, useEffect, useRef, useState } from "react"

const fullscreenElement = () => (typeof document === "undefined" ? null : document.fullscreenElement || /** @type {any} */ (document).webkitFullscreenElement || null)

/** True when the browser can put an element into native fullscreen. */
export const canUseNativeFullscreen = (element) => {
  if (typeof document === "undefined" || !element) return false
  const enabled = document.fullscreenEnabled ?? /** @type {any} */ (document).webkitFullscreenEnabled
  return Boolean(enabled && (element.requestFullscreen || element.webkitRequestFullscreen))
}

const requestNative = (element) => (element.requestFullscreen
  ? element.requestFullscreen({ navigationUI: "hide" })
  : Promise.resolve(element.webkitRequestFullscreen()))

const exitNative = () => {
  const doc = /** @type {any} */ (document)
  if (doc.exitFullscreen) return doc.exitFullscreen()
  if (doc.webkitExitFullscreen) return Promise.resolve(doc.webkitExitFullscreen())
  return Promise.resolve()
}

/**
 * Immersive map mode. Uses the browser Fullscreen API on the map element when
 * available, otherwise (or if the request is refused) a fixed full-viewport
 * overlay. Either way the same map element and renderers stay mounted, so the
 * floor, view, selection, route, and navigation progress are untouched; this
 * is a view mode only. While active, `<html data-map-immersive>` lets the app
 * shell hide its chrome and the floating CLARA trigger (CLARA's conversation
 * state is kept).
 */
export default function useMapFullscreen() {
  const targetRef = useRef(/** @type {HTMLElement | null} */ (null))
  const [state, setState] = useState({ active: false, native: false })
  const stateRef = useRef(state)
  stateRef.current = state

  const enter = useCallback(async () => {
    const element = targetRef.current
    if (!element || stateRef.current.active) return
    if (canUseNativeFullscreen(element)) {
      try {
        await requestNative(element)
        setState({ active: true, native: true })
        return
      } catch {
        // Refused (permissions policy, iframe, user gesture): use the overlay.
      }
    }
    setState({ active: true, native: false })
  }, [])

  const exit = useCallback(async () => {
    if (fullscreenElement()) {
      try { await exitNative() } catch { /* already exiting */ }
    }
    setState({ active: false, native: false })
  }, [])

  const toggle = useCallback(() => (stateRef.current.active ? exit() : enter()), [enter, exit])

  // Keep React state in step with the browser: Escape, the browser's own exit
  // control, or a failed request all arrive as events.
  useEffect(() => {
    const onChange = () => {
      const element = fullscreenElement()
      if (element && element === targetRef.current) setState({ active: true, native: true })
      else if (stateRef.current.native) setState({ active: false, native: false })
    }
    const onError = () => {
      if (!stateRef.current.active || stateRef.current.native) setState({ active: true, native: false })
    }
    document.addEventListener("fullscreenchange", onChange)
    document.addEventListener("webkitfullscreenchange", onChange)
    document.addEventListener("fullscreenerror", onError)
    document.addEventListener("webkitfullscreenerror", onError)
    return () => {
      document.removeEventListener("fullscreenchange", onChange)
      document.removeEventListener("webkitfullscreenchange", onChange)
      document.removeEventListener("fullscreenerror", onError)
      document.removeEventListener("webkitfullscreenerror", onError)
    }
  }, [])

  // Shell coordination and scroll lock for the overlay fallback.
  useEffect(() => {
    if (!state.active) return undefined
    const root = document.documentElement
    const body = document.body
    const previousOverflow = body.style.overflow
    root.dataset.mapImmersive = state.native ? "native" : "overlay"
    if (!state.native) body.style.overflow = "hidden"
    return () => {
      delete root.dataset.mapImmersive
      body.style.overflow = previousOverflow
    }
  }, [state.active, state.native])

  // Leaving the page while immersive also leaves native fullscreen.
  useEffect(() => () => {
    if (stateRef.current.native && fullscreenElement()) exitNative().catch(() => {})
  }, [])

  return { targetRef, active: state.active, native: state.native, enter, exit, toggle }
}
