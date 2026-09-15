import { DISTANCE_STATUS } from "../data/mapStandards.js"

const roundToOneDecimal = (value) => Math.round(value * 10) / 10

export function measureMapDistance(totalMapUnits, calibration = {}) {
  const requestedStatus = calibration.status || DISTANCE_STATUS.SCHEMATIC
  const mapUnitsPerMeter = Number(calibration.mapUnitsPerMeter)

  if (
    (requestedStatus === DISTANCE_STATUS.CALIBRATED || requestedStatus === DISTANCE_STATUS.VERIFIED) &&
    Number.isFinite(mapUnitsPerMeter) &&
    mapUnitsPerMeter > 0
  ) {
    const meters = roundToOneDecimal(totalMapUnits / mapUnitsPerMeter)
    return {
      status: requestedStatus,
      totalMapUnits,
      displayValue: meters,
      displayUnit: "m",
      totalDistanceMeters: meters,
      label: `Approximately ${meters} m`,
    }
  }

  const divisor = Number(calibration.schematicMapUnitsPerDisplayUnit) || 1
  const schematicUnits = roundToOneDecimal(totalMapUnits / divisor)
  return {
    status: DISTANCE_STATUS.SCHEMATIC,
    totalMapUnits,
    displayValue: schematicUnits,
    displayUnit: "map units",
    totalDistanceMeters: null,
    label: `${schematicUnits} map units / schematic distance`,
  }
}
