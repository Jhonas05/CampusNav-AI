import { useEffect, useRef, useState } from "react"
import { button } from "@/components/campus/ui"
import CampusMapCanvas from "./CampusMapCanvas"
import { getRouteSegmentForFloor } from "@/lib/navigation"
import { createGuideCamera } from "@/lib/cameraGuide"

export default function CameraGuide(props) {
  if (typeof globalThis.HTMLDialogElement?.prototype.showModal !== "function") {
    return <div className="mt-2 flex flex-wrap items-center gap-2">
      <p role="status">Camera directions are unavailable in this browser. Continue with the 2D map.</p>
      <button className={button.secondary} onClick={() => { props.onClose(); props.trigger.current?.focus() }}>Return to 2D</button>
    </div>
  }
  return <CameraDialog {...props} />
}

function CameraDialog({ route, instructions, activeStep, selectStep, position, destination, onClose, trigger, manual, scan }) {
  const dialog = useRef(null)
  const video = useRef(null)
  const owner = useRef(null)
  const [state, setState] = useState("Camera off")
  const [aligned, setAligned] = useState(false)
  const step = instructions[activeStep]
  const floor = step.floorId || position.currentFloorId
  const segment = getRouteSegmentForFloor(route, floor)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    const end = () => { owner.current?.dispose(); onClose() }
    const hidden = () => { if (document.hidden) end() }
    document.addEventListener("visibilitychange", hidden)
    window.addEventListener("pagehide", end)
    return () => {
      document.removeEventListener("visibilitychange", hidden)
      window.removeEventListener("pagehide", end)
      owner.current?.dispose()
      element.close()
    }
  }, [onClose])
  function enableCamera() {
    if (owner.current) return
    setState("Requesting camera")
    owner.current = createGuideCamera(window, video.current, setState)
    void owner.current.start()
  }
  function move(offset) {
    setAligned(false)
    selectStep(activeStep + offset)
  }
  function returnToMap() {
    dialog.current.close()
    onClose()
    trigger.current?.focus({ preventScroll: true })
  }
  return <dialog ref={dialog} aria-labelledby="camera-title" onCancel={event => { event.preventDefault(); returnToMap() }}
    className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-auto bg-canvas text-ink">
    <div className="relative isolate flex min-h-full flex-col justify-between gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <video ref={video} muted playsInline aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <header className="mx-auto w-full max-w-2xl rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="camera-title" className="font-semibold">Camera directions · {destination.name}</h2>
          <button className={button.secondary} onClick={returnToMap}>Return to 2D</button>
        </div>
        <p aria-live="polite" className="mt-2"><strong>Instruction {activeStep + 1} of {instructions.length} · {floor}</strong><br />{step.text}</p>
        <p className="mt-1 text-sm">Illustrative camera guidance — not live position tracking.</p>
      </header>
      <div className="mx-auto w-full max-w-2xl space-y-2">
        <figure className="w-48 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="pointer-events-none h-28 overflow-hidden" aria-hidden="true" ref={el => { if (el) el.inert = true }}>
            <CampusMapCanvas interactive2D={false} viewedFloorId={floor} route2D={segment} startFacilityId={position.currentFacilityId}
              destinationFacilityId={destination.id} navigationStatus="active" />
          </div>
          <figcaption className="px-2 py-1 text-xs">Planned route · {floor}</figcaption>
        </figure>
        <section className="space-y-2 rounded-2xl border border-line bg-surface p-3">
          <p role="status">{state}{state === "Camera on" && (aligned ? " · Facing manually confirmed for this instruction" : " · Facing unconfirmed")}</p>
          {state === "Camera off" && <p className="text-sm">The camera preview stays on this device. The microphone stays off.</p>}
          <div className="flex flex-wrap gap-2">
            {state === "Camera off" && <button className={button.primary} onClick={enableCamera}>Enable rear camera</button>}
            {state === "Camera on" && <button className={button.secondary} aria-pressed={aligned} onClick={() => setAligned(!aligned)}>{aligned ? "Clear facing confirmation" : "Confirm facing matches map"}</button>}
            <button className={button.secondary} disabled={activeStep === 0} onClick={() => move(-1)}>Previous instruction</button>
            <button className={button.secondary} disabled={activeStep >= instructions.length - 1} onClick={() => move(1)}>Next instruction</button>
            <button className={button.ghost} onClick={() => { owner.current?.dispose(); onClose(); manual() }}>Choose location manually</button>
            <button className={button.ghost} onClick={() => { owner.current?.dispose(); onClose(); scan() }}>Rescan QR</button>
          </div>
        </section>
      </div>
    </div>
  </dialog>
}
