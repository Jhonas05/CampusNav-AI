import { EMERGENCY_EQUIPMENT_TYPES } from "@/data/emergencyEquipment"
import { VERIFICATION_STATUS } from "@/data/mapStandards"
import { MAP_COLORS } from "@/lib/facilityCategories"

const visibleStatuses = new Set([
  VERIFICATION_STATUS.VERIFIED,
  VERIFICATION_STATUS.SOURCE_ALIGNED,
])

export default function EmergencyMapOverlay({
  nodes,
  exits,
  equipment,
  approvedEdges,
  currentNodeId,
  debugOptions,
}) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const showExits = !debugOptions || debugOptions.showEmergencyExits
  const showEquipment = !debugOptions || debugOptions.showEmergencyEquipment
  const showApprovedEdges = !debugOptions || debugOptions.showEmergencyApprovedEdges
  const showIds = Boolean(debugOptions?.showEmergencyRouteIds)
  const showStatus = Boolean(debugOptions?.showEmergencyVerificationStatus)
  const currentNode = nodeMap.get(currentNodeId)

  return (
    <g data-testid="emergency-map-overlay">
      {showApprovedEdges && approvedEdges.map((edge) => {
        const from = nodeMap.get(edge.from)
        const to = nodeMap.get(edge.to)
        if (!from || !to) return null
        return (
          <g key={edge.id}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={MAP_COLORS.exit} strokeWidth="3" strokeDasharray="10 7" opacity="0.65" />
            {showIds && (
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} textAnchor="middle" fontSize="7" fontWeight="800" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">
                {edge.id}
              </text>
            )}
          </g>
        )
      })}

      {showEquipment && equipment.filter((item) => visibleStatuses.has(item.verificationStatus)).map((item) => (
        <g key={item.id} transform={`translate(${item.x} ${item.y})`} role="img" aria-label={`${item.type.replaceAll("_", " ")} - ${item.verificationStatus}`}>
          {item.type === EMERGENCY_EQUIPMENT_TYPES.FIRE_EXTINGUISHER ? (
            <>
              <rect x="-10" y="-10" width="20" height="20" rx="3" fill={MAP_COLORS.equipment} stroke="#FFFFFF" strokeWidth="2" />
              <path d="M-5-5L5 5M5-5L-5 5" stroke="#FFFFFF" strokeWidth="2" />
              <text x="0" y="19" textAnchor="middle" fontSize="7" fontWeight="900" fill="#7F1D1D" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">FE</text>
            </>
          ) : (
            <>
              <path d="M0-11L11 0L0 11L-11 0Z" fill="#FFFFFF" stroke={MAP_COLORS.equipment} strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3.5" fill={MAP_COLORS.equipment} />
              <text x="0" y="20" textAnchor="middle" fontSize="7" fontWeight="900" fill="#7F1D1D" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">ALARM</text>
            </>
          )}
          {showStatus && <text x="13" y="-11" fontSize="6.5" fontWeight="800" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">{item.verificationStatus}</text>}
        </g>
      ))}

      {showExits && exits.filter((exit) => exit.active && visibleStatuses.has(exit.verificationStatus)).map((exit) => (
        <g key={exit.id} transform={`translate(${exit.x - 24} ${exit.y - 12})`} role="img" aria-label={`${exit.label} - ${exit.verificationStatus}`}>
          <rect width="48" height="24" rx="4" fill={MAP_COLORS.exit} stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M7 6h8v12H7M12 12h12M20 8l4 4-4 4" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="35" y="15" textAnchor="middle" fontSize="7" fontWeight="900" fill="#FFFFFF">EXIT</text>
          {showStatus && <text x="24" y="-5" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">{exit.verificationStatus}</text>}
        </g>
      ))}

      {currentNode && (
        <g transform={`translate(${currentNode.x} ${currentNode.y})`}>
          <circle r="13" fill="#FFFFFF" stroke={MAP_COLORS.current} strokeWidth="4" />
          <circle r="4.5" fill={MAP_COLORS.current} />
          <text x="0" y="-20" textAnchor="middle" fontSize="8" fontWeight="900" fill="#1D1D1F" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="4">YOU ARE HERE</text>
        </g>
      )}
    </g>
  )
}
