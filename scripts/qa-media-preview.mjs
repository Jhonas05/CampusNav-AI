// Run against an isolated, loopback production preview built with
// VITE_ENABLE_MEDIA_PREVIEW=true. QA tooling is external to the app lockfile.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.CAMPUSNAV_PLAYWRIGHT
  ? pathToFileURL(process.env.CAMPUSNAV_PLAYWRIGHT).href : 'playwright')
const origin = 'http://127.0.0.1:4197'
const browser = await chromium.launch({ executablePath: process.env.CAMPUSNAV_QA_CHROME,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
async function verifyPreview() {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  const errors = [], unexpected = []
  page.on('pageerror', e => errors.push(e.message))
  context.on('request', r => {
    if (new URL(r.url()).origin !== origin || r.method() !== 'GET') unexpected.push(r.method())
  })
  await context.addInitScript(() => {
    window.spoken = []
    window.micStarts = 0
    class Recognition {
      static async available({ processLocally }) { return processLocally ? 'available' : 'unavailable' }
      set processLocally(v) { this.local = v }
      get processLocally() { return this.local }
      start() { window.micStarts++; this.onstart() }
      stop() { this.onresult({ results: [[{ transcript: 'Library' }]] }) }
      abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text } } })
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ localService: true, lang: 'en-US' }],
      speak(u) { this.current = u; window.spoken.push(u.text); u.onstart() },
      cancel() {}, pause() { this.current.onpause() }, resume() { this.current.onresume() },
    } })
    const media = navigator.mediaDevices
    const acquire = media.getUserMedia.bind(media)
    window.captures = []
    media.getUserMedia = async constraints => {
      if (constraints.audio !== false) throw Error('Unexpected audio acquisition')
      if (window.denyCamera) throw new DOMException('Denied for this case', 'NotAllowedError')
      const stream = await acquire(constraints)
      window.captures.push(stream)
      return stream
    }
  })
  const btn = (name) => page.getByRole('button', { name, exact: true })
  await page.goto(origin)
  await btn('Open CLARA campus assistant').click()
  await page.getByRole('textbox', { name: 'Message CLARA' }).fill('Where is the Library?')
  await btn('Send message').click()
  await btn('Read Aloud').waitFor()
  assert.deepEqual(await page.evaluate(() => window.spoken), [])
  await btn('Read Aloud').click()
  await btn('Pause').click(); await btn('Resume').click(); await btn('Stop playback').click()
  await btn('Speak to CLARA').click()
  assert.equal(await page.evaluate(() => window.micStarts), 0)
  await btn('Start microphone').click(); await btn('Cancel').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  await btn('Discard').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  const transcript = page.getByRole('textbox', { name: 'Review transcript' })
  await transcript.fill('Where is the Registrar?')
  await btn('Send transcript').click()
  await page.waitForFunction(() => window.spoken.length === 2)
  const spoken = await page.evaluate(() => window.spoken.at(-1))
  assert.ok(spoken.includes('Registrar'))
  assert.ok((await page.getByRole('log').innerText()).includes(spoken))
  await btn('Mute').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  await transcript.fill('Where is the Library?')
  await btn('Send transcript').click()
  await page.getByRole('log').getByText(/CLARA said:.*Library is on/).nth(1).waitFor()
  assert.equal(await page.evaluate(() => window.spoken.length), 2)
  console.log('PASS typed/manual TTS, reviewed voice send, exact automatic response, mute and playback controls (mock speech)')

  async function routeFromLibrary() {
    await page.getByLabel('Floor of your current location').selectOption('3F')
    await page.locator('#current-location-selector').selectOption('facility:library')
    await btn('Start Navigation').filter({ visible: true }).first().click()
  }
  await page.getByRole('log').getByRole('link', { name: /Navigate to .*Registrar/i }).click()
  assert.equal(new URL(page.url()).searchParams.get('facility'), 'registrar-office')
  await btn('Camera directions').waitFor()
  assert.ok(await btn('Camera directions').isDisabled())
  await routeFromLibrary()
  await btn('Camera directions').click()
  assert.equal(await page.evaluate(() => window.captures.length), 0)
  await page.evaluate(() => { window.denyCamera = true })
  await btn('Enable rear camera').click()
  await page.getByText('Camera permission denied.', { exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await page.locator('dialog').waitFor({ state: 'detached' })
  assert.ok(await btn('Camera directions').evaluate(el => el === document.activeElement))
  await btn('Camera directions').click()
  await page.evaluate(() => { window.denyCamera = false })
  await btn('Enable rear camera').click()
  await btn('Confirm facing matches map').click()
  await btn('Next instruction').click()
  await btn('Confirm facing matches map').waitFor()
  await btn('Next instruction').click()
  assert.match(await page.locator('dialog header').innerText(), /Proceed to East Stair\./)
  while (await btn('Next instruction').isEnabled()) await btn('Next instruction').click()
  assert.match(await page.locator('dialog header').innerText(), /Arrive at/)
  await page.setViewportSize({ width: 390, height: 844 })
  assert.ok(await btn('Return to 2D').isVisible())
  const bounds = await page.locator('dialog').evaluate(el => [el.scrollWidth, el.clientWidth])
  assert.ok(bounds[0] <= bounds[1] + 1)
  await btn('Return to 2D').click()
  assert.ok(await page.evaluate(() => window.captures.every(s => s.getTracks().every(t => t.readyState === 'ended'))))
  await btn('Camera directions').click(); await btn('Enable rear camera').click()
  await btn('Confirm facing matches map').waitFor()
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    delete document.hidden
  })
  await page.locator('dialog').waitFor({ state: 'detached' })
  assert.ok(await page.evaluate(() => window.captures.every(s => s.getTracks().every(t => t.readyState === 'ended'))))
  console.log('PASS confirmed ordinary route, deliberate video-only camera, manual step/facing reset, stairs, phone layout and release (synthetic camera)')

  await page.setViewportSize({ width: 1366, height: 900 })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  await context.setOffline(true)
  await page.reload()
  await routeFromLibrary()
  await btn('Camera directions').click(); await btn('Enable rear camera').click()
  await btn('Confirm facing matches map').waitFor()
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys()
    return (await Promise.all(keys.map(async k => (await (await caches.open(k)).keys()).map(r => new URL(r.url).pathname)))).flat()
  })
  assert.ok(cached.some(p => /CameraGuide-/.test(p)))
  assert.ok(cached.every(p => /^\/(assets\/|branding\/|index\.html$|manifest\.json$)/.test(p)))
  await btn('Choose location manually').click()
  assert.ok(await btn('Camera directions').isDisabled())
  await context.setOffline(false)
  await page.goto(origin + '/map?mode=emergency')
  await page.getByRole('heading', { name: 'Emergency Mode', exact: true }).first().waitFor()
  assert.equal(await btn('Camera directions').count(), 0)
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, [])
  console.log('PASS worker-controlled offline reload, offline multi-floor guide, cached public assets, Emergency exclusion and zero unexpected network/page errors')
}

async function verifyDefaultBuild() {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto(origin)
  await page.getByRole('button', { name: 'Open CLARA campus assistant' }).click()
  await page.getByRole('textbox', { name: 'Message CLARA' }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Speak to CLARA' }).count(), 0)
  await page.goto(origin + '/map?facility=registrar-office')
  await page.getByLabel('Floor of your current location').waitFor()
  assert.equal(await page.getByRole('button', { name: 'Camera directions' }).count(), 0)
  console.log('PASS default build opens CLARA and Navigate with preview controls absent')
}

try {
  if (process.argv.includes('--default-build')) await verifyDefaultBuild()
  else await verifyPreview()
} finally {
  await browser.close()
}
