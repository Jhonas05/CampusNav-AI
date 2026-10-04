import { QrCode, RotateCcw } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { createCheckpointPayload } from "@/data/qrCheckpoints"
import { stairConnections, verticalTransitionEdges } from "@/data/stairs"

const Status = ({ pass }) => (
  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${pass ? "border-ink bg-ink text-on-ink" : "border-ink-faint bg-surface text-ink"}`}>
    {pass ? "PASS" : "FAIL"}
  </span>
)

const Stat = ({ label, value }) => (
  <div className="rounded-2xl bg-fill p-4">
    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</p>
    <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
  </div>
)

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 rounded-xl border border-line-strong px-3 py-2.5 text-xs font-medium text-ink">
    {label}
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-black" />
  </label>
)

export default function MapVerificationPanel({ floor, report, options, onChange, onReset, checkpoints, onSimulatePayload, floorReports, verticalConnectionCount, emergencyReport }) {
  const [simulatedPayload, setSimulatedPayload] = useState(createCheckpointPayload(checkpoints[0]?.id || ""))
  const update = (key, value) => onChange({ ...options, [key]: value })

  return (
    <section data-testid="map-verification-panel" className="mt-5 rounded-3xl border border-ink bg-surface p-5 md:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Developer calibration mode</p>
          <h2 className="mt-2 text-2xl font-semibold">Map Verification</h2>
          <p className="mt-2 text-sm text-ink-soft">{floor.map.sourceReference.title}, page {floor.map.sourceReference.page}. Controls affect the debug overlay only.</p>
        </div>
        <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-4 py-2 text-xs font-medium">
          <RotateCcw className="h-3.5 w-3.5" /> Reset calibration
        </button>
      </div>

      {emergencyReport && (
        <div className="mt-5 overflow-x-auto rounded-2xl border-2 border-ink">
          <div className="flex items-center justify-between gap-4 border-b border-line p-4">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-ink">Emergency graph verification</p><p className="mt-1 text-xs text-ink-faint">{emergencyReport.approvedEdgeCount} source-approved edges · {emergencyReport.pendingCount} pending emergency items</p></div>
            <Status pass={emergencyReport.pass} />
          </div>
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-fill text-ink-soft"><tr><th className="px-4 py-3">Floor</th><th className="px-4 py-3">Exits</th><th className="px-4 py-3">Extinguishers</th><th className="px-4 py-3">Fire alarms</th><th className="px-4 py-3">Approved edges</th><th className="px-4 py-3">Pending</th></tr></thead>
            <tbody>
              {emergencyReport.perFloor.map((item) => (
                <tr key={item.floorId} className="border-t border-line"><td className="px-4 py-3 font-semibold">{item.floorId}</td><td className="px-4 py-3">{item.exitCount}</td><td className="px-4 py-3">{item.extinguisherCount}</td><td className="px-4 py-3">{item.alarmCount}</td><td className="px-4 py-3">{item.approvedEdgeCount}</td><td className="px-4 py-3">{item.pendingCount}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line p-4 text-xs text-ink-soft">
            <p><span className="font-semibold text-ink">Disconnected emergency exits:</span> {emergencyReport.disconnectedExitIds.length ? emergencyReport.disconnectedExitIds.join(" · ") : "None"}</p>
            {emergencyReport.validation.errors.length > 0 && <p className="mt-2"><span className="font-semibold text-ink">Validation errors:</span> {emergencyReport.validation.errors.join(" · ")}</p>}
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Stat label="Floor" value={floor.name} />
        <Stat label="Facilities" value={report.facilityCount} />
        <Stat label="Nodes" value={report.nodeCount} />
        <Stat label="Edges" value={report.edgeCount} />
        <Stat label="Stairs" value={report.stairCount} />
        <Stat label="Verified assignments" value={report.verifiedFacilityAssignments} />
        <Stat label="Estimated geometries" value={report.estimatedGeometries} />
        <Stat label="Pending items" value={report.pendingItems} />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line-strong">
        <div className="flex items-center justify-between gap-4 border-b border-line p-4">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">GF–5F verification summary</p><p className="mt-1 text-xs text-ink-faint">{verticalConnectionCount} adjacent-floor vertical connections</p></div>
          <Status pass={floorReports.every((item) => item.routeValidationPass && item.wallCrossingPass)} />
        </div>
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-fill text-ink-soft"><tr><th className="px-4 py-3">Floor</th><th className="px-4 py-3">Facilities</th><th className="px-4 py-3">Nodes</th><th className="px-4 py-3">Edges</th><th className="px-4 py-3">Stairs</th><th className="px-4 py-3">Source-aligned</th><th className="px-4 py-3">Estimated</th><th className="px-4 py-3">Disconnected</th><th className="px-4 py-3">Graph</th></tr></thead>
          <tbody>
            {floorReports.map((item) => (
              <tr key={item.floorName} className="border-t border-line"><td className="px-4 py-3 font-semibold">{item.floorName}</td><td className="px-4 py-3">{item.facilityCount}</td><td className="px-4 py-3">{item.nodeCount}</td><td className="px-4 py-3">{item.edgeCount}</td><td className="px-4 py-3">{item.stairCount}</td><td className="px-4 py-3">{item.sourceAlignedObjects}</td><td className="px-4 py-3">{item.estimatedGeometries}</td><td className="px-4 py-3">{item.disconnectedFacilities.length}</td><td className="px-4 py-3"><Status pass={item.routeValidationPass && item.wallCrossingPass} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-line-strong p-4">
          <h3 className="text-sm font-semibold">Reference alignment</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-ink-soft">Opacity
              <input type="range" min="0" max="1" step="0.05" value={options.opacity} onChange={(event) => update("opacity", Number(event.target.value))} className="mt-2 w-full accent-black" />
            </label>
            <label className="text-xs font-medium text-ink-soft">Scale
              <input type="number" min="0.5" max="2" step="0.01" value={options.scale} onChange={(event) => update("scale", Number(event.target.value))} className="mt-2 h-9 w-full rounded-lg border border-line-strong px-3 text-ink" />
            </label>
            <label className="text-xs font-medium text-ink-soft">X offset
              <input type="number" step="1" value={options.offsetX} onChange={(event) => update("offsetX", Number(event.target.value))} className="mt-2 h-9 w-full rounded-lg border border-line-strong px-3 text-ink" />
            </label>
            <label className="text-xs font-medium text-ink-soft">Y offset
              <input type="number" step="1" value={options.offsetY} onChange={(event) => update("offsetY", Number(event.target.value))} className="mt-2 h-9 w-full rounded-lg border border-line-strong px-3 text-ink" />
            </label>
            <label className="text-xs font-medium text-ink-soft sm:col-span-2">Rotation
              <input type="range" min="-180" max="180" step="1" value={options.rotation} onChange={(event) => update("rotation", Number(event.target.value))} className="mt-2 w-full accent-black" />
              <span className="mt-1 block text-[10px] text-ink-faint">{options.rotation} degrees</span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-line-strong p-4">
          <h3 className="text-sm font-semibold">Debug layers</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Toggle label="Reference overlay" checked={options.showOverlay} onChange={(value) => update("showOverlay", value)} />
            <Toggle label="Navigation nodes" checked={options.showNodes} onChange={(value) => update("showNodes", value)} />
            <Toggle label="Graph edges" checked={options.showEdges} onChange={(value) => update("showEdges", value)} />
            <Toggle label="Room polygons" checked={options.showRooms} onChange={(value) => update("showRooms", value)} />
            <Toggle label="IDs, types, distances" checked={options.showGraphLabels} onChange={(value) => update("showGraphLabels", value)} />
            <Toggle label="Show Emergency Exits" checked={options.showEmergencyExits} onChange={(value) => update("showEmergencyExits", value)} />
            <Toggle label="Show Emergency Equipment" checked={options.showEmergencyEquipment} onChange={(value) => update("showEmergencyEquipment", value)} />
            <Toggle label="Show Emergency-Approved Edges" checked={options.showEmergencyApprovedEdges} onChange={(value) => update("showEmergencyApprovedEdges", value)} />
            <Toggle label="Show Emergency Route IDs" checked={options.showEmergencyRouteIds} onChange={(value) => update("showEmergencyRouteIds", value)} />
            <Toggle label="Show Verification Status" checked={options.showEmergencyVerificationStatus} onChange={(value) => update("showEmergencyVerificationStatus", value)} />
            <Toggle label="3D navigation nodes" checked={options.show3DNavigationNodes} onChange={(value) => update("show3DNavigationNodes", value)} />
            <Toggle label="3D graph edges" checked={options.show3DGraphEdges} onChange={(value) => update("show3DGraphEdges", value)} />
            <Toggle label="3D facility polygons" checked={options.show3DFacilityPolygons} onChange={(value) => update("show3DFacilityPolygons", value)} />
            <Toggle label="3D stair connections" checked={options.show3DStairConnections} onChange={(value) => update("show3DStairConnections", value)} />
            <Toggle label="3D node IDs" checked={options.show3DNodeIds} onChange={(value) => update("show3DNodeIds", value)} />
            <Toggle label="3D floor elevations" checked={options.show3DFloorElevations} onChange={(value) => update("show3DFloorElevations", value)} />
            <Toggle label="3D route points" checked={options.show3DRoutePoints} onChange={(value) => update("show3DRoutePoints", value)} />
          </div>

          <div className="mt-5 space-y-3 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-3 text-sm"><span>Route validation</span><Status pass={report.routeValidationPass} /></div>
            <div className="flex items-center justify-between gap-3 text-sm"><span>Wall-crossing test</span><Status pass={report.wallCrossingPass} /></div>
            {report.routeResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between gap-3 text-xs text-ink-soft">
                <span>{result.startFacilityId} → {result.destinationFacilityId}</span>
                <Status pass={result.validation.pass} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-fill p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Pending verification</p>
        <ul className="mt-2 space-y-1 text-xs text-ink-soft">
          {floor.map.pendingItems.map((item) => <li key={item.id}>• {item.label}</li>)}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl border border-line-strong p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Vertical transition information</p>
        {stairConnections.map((stair) => (
          <div key={stair.id} className="mt-3 rounded-xl bg-fill p-3 text-xs">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><p><span className="font-semibold text-ink">{stair.label}</span> · {stair.connections.map((connection) => connection.floorId).join(" → ")}</p><p className="text-ink-faint">{stair.verificationStatus} · Accessibility pending</p></div>
            <p className="mt-2 break-all font-mono text-[10px] text-ink-soft">Nodes: {stair.connections.map((connection) => connection.nodeId).join(" → ")}</p>
            <p className="mt-1 break-all font-mono text-[10px] text-ink-soft">Edges: {verticalTransitionEdges.filter((edge) => edge.stairId === stair.id).map((edge) => edge.id).join(" · ")}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-line-strong p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">QR checkpoint simulator</p><p className="mt-1 text-xs text-ink-faint">Uses the production payload parser, checkpoint validator, and location resolver.</p></div>
          <Link to="/admin/qr-checkpoints" className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-4 py-2 text-xs font-medium"><QrCode className="h-3.5 w-3.5" /> QR generator</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {checkpoints.map((checkpoint) => (
            <button key={checkpoint.id} type="button" onClick={() => { const payload = createCheckpointPayload(checkpoint.id); setSimulatedPayload(payload); onSimulatePayload(payload) }} className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-on-ink">
              Simulate {checkpoint.id}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-xs font-medium text-ink-soft">Custom or invalid payload
          <input value={simulatedPayload} onChange={(event) => setSimulatedPayload(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-line-strong bg-surface px-3 font-mono text-xs text-ink" />
        </label>
        <button type="button" onClick={() => onSimulatePayload(simulatedPayload)} className="mt-3 rounded-full border border-ink px-4 py-2 text-xs font-medium text-ink">Simulate payload</button>
      </div>
    </section>
  )
}
