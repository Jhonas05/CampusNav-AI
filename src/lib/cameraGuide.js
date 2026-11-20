export function canGuide({ route, position, destination, status, emergency, confirmed }) {
  return Boolean(confirmed && !emergency && status === "active" && destination &&
    ["QR", "MANUAL"].includes(position?.positioningMethod) && route?.nodes?.length > 1 &&
    route.startEntranceNodeId === position.currentNodeId &&
    route.nodes.at(-1).facilityId === destination.id)
}

// One acquisition per controller. Disposal also owns a late permission grant.
export function createGuideCamera(device, video, report) {
  let ended = false
  let owned
  const release = stream => stream?.getTracks().forEach(track => track.stop())
  function dispose() {
    ended = true
    release(owned)
    owned = null
    video.srcObject = null
  }
  function interrupted() {
    if (ended) return
    dispose()
    report("Camera interrupted. Return to 2D to restart.")
  }
  async function start() {
    if (!device.isSecureContext || !device.navigator.mediaDevices?.getUserMedia) {
      report("Camera unavailable. Use HTTPS or localhost on a camera-capable device.")
      return
    }
    try {
      const stream = await device.navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } })
      if (ended) { release(stream); return }
      owned = stream
      const track = stream.getVideoTracks()[0]
      if (!track || track.readyState === "ended") { interrupted(); return }
      track.addEventListener("ended", interrupted, { once: true })
      track.addEventListener("mute", interrupted, { once: true })
      video.srcObject = stream
      await video.play()
      if (!ended) report("Camera on")
    } catch (error) {
      if (ended) return
      dispose()
      report(error?.name === "NotAllowedError" ? "Camera permission denied." :
        error?.name === "NotFoundError" ? "No camera found." : "Camera unavailable or in use.")
    }
  }
  return { start, dispose }
}
