/**
 * Viewport math for the CampusNav map presentations. Everything here changes
 * only how the canonical map is shown (scale, pan, camera distance); it never
 * reads or writes geometry, graph, or route data.
 *
 * A 2D view is `{ scale, x, y }`: map units are multiplied by `scale` and
 * offset by `(x, y)` CSS pixels inside the viewport.
 */

export const MAP2D_VIEW = Object.freeze({
  padding: 16,
  // The Navigate default keeps rooms readable: at least this many CSS pixels
  // of map width (the long-standing 860px minimum of the scrolling 2D map).
  fillWidthMinimum: 860,
  minFitRatio: 0.6,
  maxFitRatio: 8,
  maxAbsolute: 3,
  zoomStep: 1.25,
  keyboardPan: 64,
  edgeMargin: 64,
})

const isSize = (size) => Boolean(size && size.width > 0 && size.height > 0)

/** Scale that shows the whole map inside the viewport. */
export const getFitScale = ({ viewport, content, padding = MAP2D_VIEW.padding }) => {
  if (!isSize(viewport) || !isSize(content)) return 1
  const width = Math.max(1, viewport.width - padding * 2)
  const height = Math.max(1, viewport.height - padding * 2)
  return Math.min(width / content.width, height / content.height)
}

export const getScaleLimits = ({ viewport, content }) => {
  const fit = getFitScale({ viewport, content })
  return {
    min: fit * MAP2D_VIEW.minFitRatio,
    max: Math.max(fit * MAP2D_VIEW.maxFitRatio, MAP2D_VIEW.maxAbsolute),
  }
}

/** Centers a map point (map units) in the viewport at the given scale. */
export const centerOn = ({ point, scale, viewport }) => ({
  scale,
  x: viewport.width / 2 - point.x * scale,
  y: viewport.height / 2 - point.y * scale,
})

/**
 * Keeps part of the map on screen and the scale inside its limits. A map that
 * is smaller than the viewport stays fully visible on that axis.
 */
export const clampView = (view, { viewport, content }) => {
  if (!isSize(viewport) || !isSize(content)) return view
  const limits = getScaleLimits({ viewport, content })
  const scale = Math.min(limits.max, Math.max(limits.min, view.scale))
  const clampAxis = (offset, viewportLength, contentLength) => {
    const scaled = contentLength * scale
    if (scaled <= viewportLength) {
      return Math.min(viewportLength - scaled, Math.max(0, offset))
    }
    const margin = Math.min(MAP2D_VIEW.edgeMargin, viewportLength / 2)
    return Math.min(viewportLength - margin, Math.max(margin - scaled, offset))
  }
  return {
    scale,
    x: clampAxis(view.x, viewport.width, content.width),
    y: clampAxis(view.y, viewport.height, content.height),
  }
}

/**
 * The intended starting view. "fit" shows the whole floor; "fill-width"
 * keeps the readable Navigate scale (map at least `fillWidthMinimum` pixels
 * wide, otherwise the viewport width) centered on the floor.
 */
export const getDefaultView = ({ viewport, content, mode = "fit" }) => {
  if (!isSize(viewport) || !isSize(content)) return { scale: 1, x: 0, y: 0 }
  const fit = getFitScale({ viewport, content })
  const scale = mode === "fill-width"
    ? Math.max(fit, Math.max(MAP2D_VIEW.fillWidthMinimum, viewport.width - MAP2D_VIEW.padding * 2) / content.width)
    : fit
  const view = centerOn({ point: { x: content.width / 2, y: content.height / 2 }, scale, viewport })
  return clampView(view, { viewport, content })
}

/** Zooms by `factor`, keeping the viewport point `anchor` (CSS pixels) fixed. */
export const zoomAt = (view, factor, anchor, bounds) => {
  const limits = getScaleLimits(bounds)
  const scale = Math.min(limits.max, Math.max(limits.min, view.scale * factor))
  const ratio = scale / view.scale
  return clampView({
    scale,
    x: anchor.x - (anchor.x - view.x) * ratio,
    y: anchor.y - (anchor.y - view.y) * ratio,
  }, bounds)
}

export const panBy = (view, dx, dy, bounds) => clampView({ ...view, x: view.x + dx, y: view.y + dy }, bounds)

/** Bounding box (map units) of a polygon, with its center. */
export const getPolygonBox = (polygon = []) => {
  if (!polygon.length) return null
  const xs = polygon.map((point) => point.x)
  const ys = polygon.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 } }
}

/**
 * View that centers a facility's room. The scale never drops below the
 * current one and is raised to `minimumScale` when the map is far out.
 */
export const getFocusView = ({ view, box, viewport, content, minimumScale }) => {
  if (!box) return view
  const scale = Math.max(view.scale, minimumScale)
  return clampView(centerOn({ point: box.center, scale, viewport }), { viewport, content })
}

/** Keeps the map point at the viewport center fixed when the viewport resizes. */
export const resizeView = (view, previous, next, content) => {
  if (!isSize(previous)) return getDefaultView({ viewport: next, content })
  return clampView({
    scale: view.scale,
    x: view.x + (next.width - previous.width) / 2,
    y: view.y + (next.height - previous.height) / 2,
  }, { viewport: next, content })
}

export const viewToTransform = (view) => `translate(${view.x.toFixed(2)} ${view.y.toFixed(2)}) scale(${view.scale.toFixed(4)})`

export const interpolateView = (from, to, t) => ({
  scale: from.scale + (to.scale - from.scale) * t,
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
})

/**
 * Camera distance that frames a bounding sphere of `radius` for a perspective
 * camera with vertical field of view `fovDeg` and viewport `aspect`. The
 * narrower of the vertical and horizontal fields controls the fit.
 */
export const getFitDistance = ({ radius, fovDeg, aspect, margin = 1.08 }) => {
  const vertical = (fovDeg * Math.PI) / 180
  const safeAspect = aspect > 0 ? aspect : 1
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * safeAspect)
  const limiting = Math.min(vertical, horizontal)
  return (radius / Math.sin(limiting / 2)) * margin
}
