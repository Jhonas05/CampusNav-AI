export function spokenAnswer(reply) {
  return reply?.role === "assistant" && reply.speechScope === "PUBLIC"
    && reply.verified === true && reply.mode === "VERIFIED_DIRECT" && reply.sources?.length
    ? reply.text : ""
}

export function createPlayback(device, report) {
  const synth = device.speechSynthesis
  let current = null
  let timer
  function stop() {
    clearTimeout(timer)
    if (!current) return
    current = null
    synth.cancel()
    report("Stopped")
  }
  function play(reply) {
    stop()
    const text = spokenAnswer(reply)
    if (!text) return
    try {
      const voices = synth?.getVoices().filter(voice => voice.localService)
      const voice = voices?.find(voice => /^en\b/i.test(voice.lang)) || voices?.[0]
      if (!voice || !device.SpeechSynthesisUtterance) { report("Local audio unavailable"); return }
      const utterance = new device.SpeechSynthesisUtterance(text)
      current = utterance
      utterance.voice = voice
      utterance.lang = voice.lang
      const event = (label, finished = false) => () => {
        if (utterance !== current) return
        clearTimeout(timer)
        if (finished) current = null
        report(label)
      }
      utterance.onstart = event("Speaking")
      utterance.onpause = event("Paused")
      utterance.onresume = event("Speaking")
      utterance.onend = event("Finished", true)
      utterance.onerror = event("Audio unavailable", true)
      report("Starting audio")
      timer = setTimeout(() => { stop(); report("Audio unavailable") }, 5000)
      synth.speak(utterance)
    } catch { stop(); report("Audio unavailable") }
  }
  return { play, stop, pause() { if (current) synth.pause() }, resume() { if (current) synth.resume() } }
}

// Only use an already installed local recognizer. Never request a language
// download or fall back to a vendor's default (possibly remote) recognition.
export function createLocalRecognition(device, language, report, review) {
  let engine
  let cancelled = false
  let captureTimer, finishTimer
  function cancel() {
    cancelled = true
    clearTimeout(captureTimer)
    clearTimeout(finishTimer)
    if (engine) {
      engine.onresult = engine.onend = engine.onerror = engine.onstart = null
      const previous = engine
      engine = null
      previous.abort()
    }
  }
  function stop() {
    if (cancelled || !engine) return
    clearTimeout(captureTimer)
    report("Transcribing")
    finishTimer = setTimeout(() => { cancel(); report("Transcription timed out") }, 4000)
    engine.stop()
  }
  async function start() {
    try {
      const Recognition = device.SpeechRecognition || device.webkitSpeechRecognition
      captureTimer = setTimeout(() => { cancel(); report("Microphone request timed out. Retry or type your question.") }, 20000)
      if (!device.isSecureContext || !Recognition?.available ||
        !("processLocally" in Recognition.prototype) ||
        await Recognition.available({ langs: [language], processLocally: true }) !== "available") {
        if (!cancelled) {
          cancel()
          report("On-device recognition unavailable. Type your question.")
        }
        return
      }
      if (cancelled) return
      engine = new Recognition()
      engine.processLocally = true
      if (engine.processLocally !== true) throw new Error()
      engine.lang = language
      engine.continuous = false
      engine.interimResults = false
      engine.onstart = () => {
        clearTimeout(captureTimer)
        report("Listening")
        captureTimer = setTimeout(stop, 15000)
      }
      engine.onresult = event => {
        const text = event.results[0]?.[0]?.transcript?.trim()
        cancel()
        if (text && text.length <= 500) review(text)
        else report("Please retry with a shorter question")
      }
      engine.onerror = event => {
        cancel()
        report(event.error === "not-allowed" ? "Microphone permission denied" : "Recognition unavailable")
      }
      engine.onend = () => { cancel(); report("No transcript received") }
      engine.start()
    } catch { if (!cancelled) { cancel(); report("Recognition unavailable") } }
  }
  return { start, stop, cancel }
}
