import { VERIFICATION_STATUS } from "./mapStandards.js"

export const MAP3D_CONFIG = Object.freeze({
  mapScale: 0.02,
  wallHeight: 1.1,
  roomHeight: 0.28,
  floorThickness: 0.14,
  floorSpacing: 1.45,
  explodedSpacing: 2.1,
  routeOffset: 0.5,
  markerOffset: 0.68,
  cameraDistance: 25,
  verticalDimensionStatus: VERIFICATION_STATUS.ESTIMATED,
})

export const MAP3D_VIEW_MODES = Object.freeze({
  STACKED: "STACKED",
  EXPLODED: "EXPLODED",
})

export const MAP3D_GEOMETRY_NOTICE = "Horizontal geometry uses the existing source-aligned 2D maps. All 3D heights and floor spacing are schematic estimates, not architectural measurements."

