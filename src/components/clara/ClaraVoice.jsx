import { Mic } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { button, focusRing } from "@/components/campus/ui"
import { useConnectivity } from "@/contexts/ConnectivityContext"
import { createLocalRecognition, createPlayback, spokenAnswer } from "@/services/claraSpeech"

const captureStages = ["Checking microphone", "Listening", "Transcribing"]

export default function ClaraVoice({ messages, pending, onSend }) {
  const { isOnline } = useConnectivity()
  const [active, setActive] = useState(false)
  const [muted, setMuted] = useState(false)
  const [audio, setAudio] = useState("")
  const [stage, setStage] = useState("Ready")
  const [draft, setDraft] = useState("")
  const [language, setLanguage] = useState("en-US")
  const recognition = useRef(null)
  const playback = useRef(null)
  const expected = useRef(null)
  const voiceRegion = useRef(null)
  const toggle = useRef(null)
  const start = useRef(null)
  const cancel = useRef(null)
  const transcript = useRef(null)
  const nextFocus = useRef(null)
  const last = messages[messages.length - 1]
  const latestUser = messages.findLast(message => message.role === "user")
  const recording = captureStages.includes(stage)
  const reviewing = stage === "Review transcript"
  const playing = ["Speaking", "Starting audio", "Paused"].includes(audio)

  useLayoutEffect(() => {
    nextFocus.current?.current?.focus()
    nextFocus.current = null
  })

  function cancelInput() {
    recognition.current?.cancel()
    recognition.current = null
    setDraft("")
    setStage("Ready")
  }
  function stopAudio() {
    expected.current = null
    playback.current?.stop()
  }
  function leave() {
    cancelInput()
    stopAudio()
    setActive(false)
    setMuted(false)
    setAudio("")
  }
  useEffect(() => {
    playback.current = createPlayback(window, setAudio)
    // Some browsers load their voice list asynchronously on the first query.
    window.speechSynthesis?.getVoices()
    const hidden = () => { if (document.hidden) leave() }
    document.addEventListener("visibilitychange", hidden)
    window.addEventListener("pagehide", leave)
    return () => {
      document.removeEventListener("visibilitychange", hidden)
      window.removeEventListener("pagehide", leave)
      recognition.current?.cancel()
      stopAudio()
    }
  }, [])
  useEffect(() => {
    if (!isOnline) leave()
  }, [isOnline])
  useEffect(() => {
    cancelInput()
  }, [latestUser])
  useEffect(() => {
    playback.current?.stop()
    const wanted = expected.current
    if (latestUser?.voiceRequest !== wanted) expected.current = null
    if (last.role === "assistant") {
      expected.current = null
      if (wanted && latestUser?.voiceRequest === wanted && last.voiceRequest === wanted && active && !muted && isOnline && !document.hidden) {
        if (spokenAnswer(last)) playback.current?.play(last)
        else setAudio("Text-only response")
      }
    }
  }, [last, latestUser, active, muted, isOnline])

  function updateStage(next) {
    if (voiceRegion.current?.contains(document.activeElement)) {
      if (next === "Review transcript") nextFocus.current = transcript
      else if (!captureStages.includes(next)) nextFocus.current = start
    }
    setStage(next)
  }

  function returnToStart() {
    nextFocus.current = start
    cancelInput()
  }

  function listen() {
    cancelInput()
    stopAudio()
    nextFocus.current = cancel
    setStage("Checking microphone")
    recognition.current = createLocalRecognition(window, language, updateStage, text => {
      setDraft(text)
      updateStage("Review transcript")
    })
    void recognition.current.start()
  }
  function submit() {
    if (!draft.trim() || pending || !isOnline || stage !== "Review transcript") return
    expected.current = Symbol("reviewed voice question")
    onSend(draft.trim(), expected.current)
    nextFocus.current = toggle
    cancelInput()
  }
  const canRead = Boolean(spokenAnswer(last))
  return <section ref={voiceRegion} aria-label="Voice accessibility" className="max-h-[50%] shrink-0 overflow-y-auto overscroll-contain border-t border-line px-3 py-1 text-sm">
    <div className="flex flex-wrap items-center gap-1">
      <button ref={toggle} className={button.ghost} disabled={!active && !isOnline} onClick={() => active ? leave() : setActive(true)}>
        <Mic size={16} aria-hidden="true" />{active ? "Exit Voice Mode" : "Speak to CLARA"}
      </button>
      {canRead && <button className={button.ghost} disabled={pending || muted || recording || reviewing || !isOnline} onClick={() => playback.current?.play(last)}>Read Aloud</button>}
    </div>
    {active && <>
      {!reviewing && !recording && !pending && <p className="text-ink-soft">Audio stays on this device. Speak for up to 15 seconds, then review your transcript. Eligible public replies play aloud.</p>}
      <div className="flex flex-wrap items-center gap-1">
        {!reviewing && !recording && !pending && <select aria-label="Recognition language" className={`min-h-11 rounded-lg border border-line bg-surface px-2 ${focusRing}`} value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="en-US">English</option><option value="fil-PH">Filipino</option>
        </select>}
        {recording ? <>
          {stage === "Listening" && <button className={button.primary} onClick={() => { nextFocus.current = cancel; recognition.current?.stop() }}>Finish speaking</button>}
          <button ref={cancel} className={button.ghost} onClick={returnToStart}>Cancel</button>
        </> : !reviewing && !pending && <button ref={start} className={button.primary} onClick={listen}>{stage === "Ready" ? "Start microphone" : "Retry microphone"}</button>}
        <button className={button.ghost} aria-pressed={muted} onClick={() => { stopAudio(); setMuted(!muted) }}>{muted ? "Unmute" : "Mute"}</button>
      </div>
      {reviewing && <>
        <label className="block">Review transcript<textarea ref={transcript} className={`block min-h-11 w-full rounded border border-line bg-surface p-2 text-base ${focusRing}`} value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} /></label>
        <button className={button.primary} disabled={!draft.trim() || pending} onClick={submit}>Send transcript</button>
        <button className={button.ghost} onClick={returnToStart}>Discard</button>
      </>}
    </>}
    <div role="status">{[active && (pending ? "Processing CLARA question" : stage !== "Ready" && stage), muted ? "Muted" : audio].filter(Boolean).join(" · ")}</div>
    {(audio === "Speaking" || audio === "Paused") && <button className={button.ghost} onClick={() => audio === "Paused" ? playback.current?.resume() : playback.current?.pause()}>{audio === "Paused" ? "Resume" : "Pause"}</button>}
    {(pending && active || playing) && <button className={button.ghost} onClick={() => { toggle.current?.focus(); stopAudio() }}>Stop playback</button>}
  </section>
}
