import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createLocalRecognition, createPlayback, spokenAnswer } from '../src/services/claraSpeech.js'
import { canGuide, createGuideCamera } from '../src/lib/cameraGuide.js'
import { askClara } from '../src/services/claraService.js'

test('CLARA permits exact displayed public facility answers only with explicit classification', async () => {
  const reply = { ...await askClara('Where is the Library?'), role: 'assistant' }
  assert.equal(spokenAnswer(reply), reply.text)
  for (const change of [{ role: 'user' }, { speechScope: 'RESTRICTED' }, { speechScope: undefined }, { verified: false }, { sources: [] }]) {
    assert.equal(spokenAnswer({ ...reply, ...change }), '')
  }
  assert.equal(spokenAnswer({ role: 'assistant', ...await askClara('Where is my professor?') }), '')
})

test('speech uses only local voices, reports real events and ignores superseded callbacks', async () => {
  const reply = { ...await askClara('Where is the Library?'), role: 'assistant' }
  let utterance
  const states = []
  let voices = [{ lang: 'en-US', localService: false }]
  let stops = 0
  const synth = { getVoices: () => voices, speak: u => { utterance = u }, cancel: () => stops++,
    pause: () => utterance.onpause(), resume: () => utterance.onresume() }
  const audio = createPlayback({ speechSynthesis: synth, SpeechSynthesisUtterance: class { constructor(text) { this.text = text } } }, s => states.push(s))
  audio.play(reply)
  assert.equal(states.at(-1), 'Local audio unavailable')
  assert.equal(utterance, undefined)
  voices = [{ lang: 'en-US', localService: true }]
  audio.play(reply)
  assert.equal(utterance.text, reply.text)
  utterance.onstart(); audio.pause(); audio.resume()
  assert.deepEqual(states.slice(-3), ['Speaking', 'Paused', 'Speaking'])
  const old = utterance
  audio.play(reply)
  old.onend()
  assert.equal(states.at(-1), 'Starting audio')
  utterance.onerror()
  assert.equal(states.at(-1), 'Audio unavailable')
  audio.play(reply); audio.stop()
  assert.equal(stops, 2)
})

test('recognition refuses missing local capabilities and cancelled prechecks', async () => {
  let started = 0, resolve
  const states = []
  class Recognizer {
    static available = () => new Promise(done => { resolve = done })
    get processLocally() { return true }
    start() { started++ }
  }
  const session = device => createLocalRecognition(device, 'en-US', s => states.push(s), assert.fail)
  await session({ isSecureContext: true, SpeechRecognition: class {} }).start()
  assert.match(states.pop(), /unavailable/)
  const pending = session({ isSecureContext: true, SpeechRecognition: Recognizer })
  const wait = pending.start(); pending.cancel(); resolve('available'); await wait
  assert.equal(started, 0)
})

test('denied microphone and discarded transcript never send a question', async () => {
  let engine, status
  class Recognizer {
    static available = async () => 'available'
    set processLocally(local) { this.local = local }
    get processLocally() { return this.local }
    constructor() { engine = this }
    start() { this.onstart() }
    abort() {}
  }
  const create = () => createLocalRecognition({ isSecureContext: true, SpeechRecognition: Recognizer }, 'fil-PH', v => { status = v }, assert.fail)
  const first = create()
  await first.start()
  assert.equal(status, 'Listening')
  assert.equal(engine.processLocally, true)
  engine.onerror({ error: 'not-allowed' })
  assert.equal(status, 'Microphone permission denied')
  const next = create(); await next.start(); next.cancel()
  assert.equal(engine.onresult, null)
})

test('camera guide consumes only a valid active ordinary route from the confirmed endpoints', () => {
  const input = { confirmed: true, status: 'active', destination: { id: 'library' },
    route: { startEntranceNodeId: 'a', nodes: [{ id: 'a' }, { facilityId: 'library' }] },
    position: { positioningMethod: 'QR', currentNodeId: 'a' } }
  assert.ok(canGuide(input))
  for (const change of [{ confirmed: false }, { status: 'arrived' }, { emergency: true }, { route: null },
    { position: {} }, { destination: { id: 'other' } }]) assert.equal(canGuide({ ...input, ...change }), false)
})

test('camera grants arriving after exit are released; denial and revocation fail closed', async () => {
  let resolve, reject, ended, stops = 0
  const track = { stop: () => stops++, addEventListener: (event, fn) => { if (event === 'ended') ended = fn } }
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] }
  const video = { srcObject: null, play: async () => {} }
  const states = []
  const device = { isSecureContext: true, navigator: { mediaDevices: { getUserMedia: constraints => {
    assert.deepEqual(constraints, { audio: false, video: { facingMode: { ideal: 'environment' } } })
    return new Promise((ok, err) => { resolve = ok; reject = err })
  } } } }
  const create = () => createGuideCamera(device, video, s => states.push(s))
  const first = create(); const late = first.start(); first.dispose(); resolve(stream); await late
  assert.equal(stops, 1); assert.equal(video.srcObject, null)
  const denied = create().start(); reject({ name: 'NotAllowedError' }); await denied
  assert.equal(states.at(-1), 'Camera permission denied.')
  const granted = create().start(); resolve(stream); await granted; ended()
  assert.match(states.at(-1), /interrupted/); assert.equal(video.srcObject, null); assert.equal(stops, 2)
})
