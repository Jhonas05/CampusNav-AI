import { Mic } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { button } from "@/components/campus/ui"
import { useConnectivity } from "@/contexts/ConnectivityContext"
import { createLocalRecognition, createPlayback, spokenAnswer } from "@/services/claraSpeech"

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
  const last = messages[messages.length - 1]
  const recording = ["Checking microphone", "Listening", "Transcribing"].includes(stage)

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
    if (last.role === "user" || last.id === 0) cancelInput()
  }, [last])
  useEffect(() => {
    playback.current?.stop()
    if (last.role === "assistant") {
      const wanted = expected.current
      expected.current = null
      if (wanted && last.voiceRequest === wanted && active && !muted && isOnline && !document.hidden) {
        if (spokenAnswer(last)) playback.current?.play(last)
        else setAudio("Text-only response")
      }
    }
  }, [last, active, muted, isOnline])

  function listen() {
    cancelInput()
    stopAudio()
    setStage("Checking microphone")
    recognition.current = createLocalRecognition(window, language, setStage, text => {
      setDraft(text)
      setStage("Review transcript")
    })
    void recognition.current.start()
  }
  function submit() {
    if (!draft.trim() || pending || !isOnline || stage !== "Review transcript") return
    expected.current = Symbol("reviewed voice question")
    onSend(draft.trim(), expected.current)
    cancelInput()
  }
  const canRead = Boolean(spokenAnswer(last))
  return <section aria-label="Voice accessibility" className="max-h-[40%] shrink-0 overflow-y-auto border-t border-line px-3 py-1 text-sm">
    <div className="flex flex-wrap items-center gap-1">
      <button className={button.ghost} disabled={!active && !isOnline} onClick={() => active ? leave() : setActive(true)}>
        <Mic size={16} aria-hidden="true" />{active ? "Exit Voice Mode" : "Speak to CLARA"}
      </button>
      {canRead && <button className={button.ghost} disabled={muted || recording || !isOnline} onClick={() => playback.current?.play(last)}>Read Aloud</button>}
    </div>
    {active && <>
      <p className="text-ink-soft">Audio stays on this device. Speak for up to 15 seconds, then review the text before sending it to CLARA. Eligible public replies play aloud{muted ? " when unmuted" : ""}.</p>
      <div className="flex flex-wrap items-center gap-1">
        <select aria-label="Recognition language" className="min-h-11 bg-surface" value={language} disabled={recording} onChange={e => setLanguage(e.target.value)}>
          <option value="en-US">English</option><option value="fil-PH">Filipino</option>
        </select>
        {recording ? <>
          {stage === "Listening" && <button className={button.secondary} onClick={() => recognition.current?.stop()}>Finish speaking</button>}
          <button className={button.ghost} onClick={cancelInput}>Cancel</button>
        </> : <button className={button.secondary} disabled={pending} onClick={listen}>{stage === "Ready" ? "Start microphone" : "Retry microphone"}</button>}
        <button className={button.ghost} aria-pressed={muted} onClick={() => { stopAudio(); setMuted(!muted) }}>{muted ? "Unmute" : "Mute"}</button>
      </div>
      {stage === "Review transcript" && <>
        <label className="block">Review transcript<textarea className="block min-h-11 w-full rounded border border-line bg-surface p-2" value={draft} maxLength={500} onChange={e => setDraft(e.target.value)} /></label>
        <button className={button.primary} disabled={!draft.trim() || pending} onClick={submit}>Send transcript</button>
        <button className={button.ghost} onClick={cancelInput}>Discard</button>
      </>}
    </>}
    <div role="status">{[active && (pending ? "Processing CLARA question" : stage), muted ? "Muted" : audio].filter(Boolean).join(" · ")}</div>
    {audio === "Speaking" && <button className={button.ghost} onClick={() => playback.current?.pause()}>Pause</button>}
    {audio === "Paused" && <button className={button.ghost} onClick={() => playback.current?.resume()}>Resume</button>}
    {(pending && active || ["Speaking", "Starting audio", "Paused"].includes(audio)) && <button className={button.ghost} onClick={stopAudio}>Stop playback</button>}
  </section>
}
