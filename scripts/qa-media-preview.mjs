// Run against an isolated, loopback production preview built with
// VITE_ENABLE_MEDIA_PREVIEW=true. QA tooling is external to the app lockfile.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import QRCode from 'qrcode'
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
  let testingOffline = false
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', message => {
    if (message.type() === 'error' && !(testingOffline && message.text().includes('ERR_INTERNET_DISCONNECTED'))) errors.push(message.text())
  })
  context.on('request', r => {
    if (new URL(r.url()).origin !== origin || r.method() !== 'GET') unexpected.push(r.method())
  })
  const checkpointImage = await QRCode.toDataURL('CAMPUSNAV:CHECKPOINT:QR-3F-LIBRARY', { width: 360 })
  await context.addInitScript(({ checkpointImage }) => {
    window.spoken = []
    window.micStarts = 0
    class Recognition {
      static async available({ processLocally }) { return processLocally ? 'available' : 'unavailable' }
      set processLocally(v) { this.local = v }
      get processLocally() { return this.local }
      start() {
        window.micStarts++
        window.lastLanguage = this.lang
        if (window.denyMicrophone) this.onerror({ error: 'not-allowed' })
        else this.onstart()
      }
      stop() { this.onresult({ results: [[{ transcript: 'Library' }]] }) }
      abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class { constructor(text) { this.text = text } } })
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ localService: true, lang: 'en-US' }],
      paused: false,
      speak(u) { this.current = u; if (!this.paused) { window.spoken.push(u.text); u.onstart() } },
      cancel() { this.current = null },
      pause() { this.paused = true; this.current.onpause() },
      resume() { this.paused = false; this.current?.onresume() },
    } })
    const media = navigator.mediaDevices
    const acquire = media.getUserMedia.bind(media)
    window.captures = []
    media.getUserMedia = async constraints => {
      if (constraints.audio !== false) throw Error('Unexpected audio acquisition')
      if (window.denyCamera) throw new DOMException('Denied for this case', 'NotAllowedError')
      if (window.useCheckpointFrame) {
        window.guideReleasedForQr = window.captures.at(-1).getTracks().every(track => track.readyState === 'ended')
        const image = new Image()
        image.src = checkpointImage
        await image.decode()
        const canvas = Object.assign(document.createElement('canvas'), { width: 360, height: 360 })
        const frame = canvas.getContext('2d')
        const stream = canvas.captureStream(10)
        frame.drawImage(image, 0, 0)
        window.captures.push(stream)
        return stream
      }
      const stream = await acquire(constraints)
      window.captures.push(stream)
      return stream
    }
  }, { checkpointImage })
  const btn = (name) => page.getByRole('button', { name, exact: true })
  await page.goto(origin)
  await btn('Open CLARA campus assistant').click()
  await page.getByRole('textbox', { name: 'Message CLARA' }).fill('Where is the Library?')
  await btn('Send message').click()
  await btn('Read Aloud').waitFor()
  assert.deepEqual(await page.evaluate(() => window.spoken), [])
  await btn('Read Aloud').click()
  await btn('Pause').click(); await btn('Resume').click(); await btn('Pause').click(); await btn('Stop playback').click()
  await btn('Speak to CLARA').click()
  assert.equal(await page.evaluate(() => window.micStarts), 0)
  await page.evaluate(() => { window.SpeechRecognition.available = async () => 'downloadable' })
  await btn('Start microphone').click()
  await page.getByRole('region', { name: 'Voice accessibility' }).getByRole('status')
    .filter({ hasText: 'On-device recognition unavailable. Type your question.' }).waitFor()
  assert.equal(await page.evaluate(() => window.micStarts), 0)
  assert.ok(await page.getByRole('textbox', { name: 'Message CLARA' }).isEditable())
  await btn('Exit Voice Mode').click()
  await page.evaluate(() => { window.SpeechRecognition.available = async ({ processLocally }) => processLocally ? 'available' : 'unavailable' })
  await btn('Speak to CLARA').click()
  await page.getByRole('combobox', { name: 'Recognition language' }).selectOption('fil-PH')
  await page.evaluate(() => { window.denyMicrophone = true })
  await btn('Start microphone').click()
  await page.getByText('Microphone permission denied', { exact: true }).waitFor()
  assert.ok(await btn('Retry microphone').evaluate(el => el === document.activeElement))
  assert.ok(await page.getByRole('textbox', { name: 'Message CLARA' }).isEditable())
  await page.evaluate(() => { window.denyMicrophone = false })
  await btn('Retry microphone').click(); await btn('Cancel').click()
  assert.equal(await page.evaluate(() => window.lastLanguage), 'fil-PH')
  await btn('Start microphone').click(); await btn('Cancel').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  await btn('Discard').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  const transcript = page.getByRole('textbox', { name: 'Review transcript' })
  assert.ok(await transcript.evaluate(el => el === document.activeElement))
  assert.equal(await btn('Retry microphone').count(), 0)
  await transcript.fill('Nasaan ang Registrar?')
  await btn('Send transcript').click()
  await page.waitForFunction(() => window.spoken.length === 2)
  const spoken = await page.evaluate(() => window.spoken.at(-1))
  assert.ok(spoken.includes('Registrar'))
  assert.equal(await page.getByRole('log').getByText(`CLARA said: ${spoken}`, { exact: true }).count(), 1)
  await btn('Mute').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  await transcript.fill('Where is the Library?')
  await btn('Send transcript').click()
  await page.getByRole('log').getByText(/CLARA said:.*Library is on/).nth(1).waitFor()
  assert.equal(await page.evaluate(() => window.spoken.length), 2)
  await btn('Unmute').click()
  await btn('Start microphone').click(); await btn('Finish speaking').click()
  await transcript.fill('Where is my professor?')
  await btn('Send transcript').click()
  await page.getByText('Text-only response', { exact: true }).waitFor()
  assert.equal(await btn('Read Aloud').count(), 0)
  assert.equal(await page.evaluate(() => window.spoken.length), 2)
  console.log('PASS typed/manual speech, paused stop to automatic reply, Filipino/Taglish transcript review, permission denial, focus, mute and personnel-answer suppression (mock speech)')

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
  assert.ok(await page.locator('dialog').getByRole('status').evaluate(el => el === document.activeElement))
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
  await page.evaluate(() => { window.useCheckpointFrame = true })
  await btn('Rescan QR').click()
  const confirm = page.getByRole('dialog', { name: 'Location Confirmed' }).getByRole('button', { name: 'Choose Destination', exact: true })
  await confirm.waitFor()
  assert.ok(await page.evaluate(() => window.guideReleasedForQr && window.captures.every(s => s.getTracks().every(t => t.readyState === 'ended'))))
  await confirm.click()
  await page.evaluate(() => { window.useCheckpointFrame = false })
  await btn('Start Navigation').filter({ visible: true }).first().click()
  assert.ok(await btn('Camera directions').isEnabled())
  console.log('PASS camera-to-QR stream handoff, real ZXing decode of a synthetic checkpoint frame, explicit confirmation and canonical route restart')
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

  for (const [width, height] of [[390, 844], [844, 390], [820, 1180], [1180, 820]]) {
    await page.setViewportSize({ width, height })
    const largeText = width === 390 ? await page.addStyleTag({ content: 'html { font-size: 200% }' }) : null
    await btn('Open CLARA campus assistant').click()
    const chat = page.getByRole('dialog', { name: 'CLARA' })
    await btn('Speak to CLARA').click()
    await btn('Start microphone').click(); await btn('Finish speaking').click()
    assert.ok(await transcript.evaluate(el => el === document.activeElement))
    assert.ok(await chat.evaluate(el => {
      const bounds = el.getBoundingClientRect()
      return bounds.top >= 0 && bounds.bottom <= innerHeight && bounds.left >= 0 && bounds.right <= innerWidth
    }))
    if (width === 820) {
      await page.evaluate(() => {
        Object.defineProperty(window.visualViewport, 'height', { value: innerHeight - 350, configurable: true })
        window.visualViewport.dispatchEvent(new Event('resize'))
      })
      await page.waitForFunction(() => document.getElementById('clara-chat-panel').getBoundingClientRect().bottom <= innerHeight - 350)
      await page.evaluate(() => {
        delete window.visualViewport.height
        window.visualViewport.dispatchEvent(new Event('resize'))
      })
    }
    assert.ok(await chat.getByRole('button', { name: 'Close CLARA and end this conversation' }).evaluate(el =>
      el.getBoundingClientRect().right <= el.closest('section').getBoundingClientRect().right))
    await page.keyboard.press('Escape')
    await chat.waitFor({ state: 'detached' })
    await btn('Camera directions').click()
    assert.ok(await page.locator('dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1))
    await btn('Return to 2D').focus()
    await page.keyboard.press('Tab')
    assert.ok(await page.locator('dialog').evaluate(el => el.contains(document.activeElement)))
    await page.keyboard.press('Escape')
    assert.ok(await btn('Camera directions').evaluate(el => el === document.activeElement))
    await largeText?.evaluate(el => el.remove())
  }
  console.log('PASS active-route CLARA and camera at phone/tablet portrait and landscape, 200% root text, simulated tablet keyboard, focus and reduced motion')

  await page.setViewportSize({ width: 1366, height: 900 })
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  testingOffline = true
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
  testingOffline = false
  await page.goto(origin + '/map?mode=emergency')
  await page.getByRole('heading', { name: 'Emergency Mode', exact: true }).first().waitFor()
  assert.equal(await btn('Camera directions').count(), 0)
  await page.addInitScript(() => { HTMLDialogElement.prototype.showModal = undefined })
  await page.goto(origin + '/map?facility=registrar-office')
  await routeFromLibrary()
  await btn('Camera directions').click()
  await page.getByText('Camera directions are unavailable in this browser. Continue with the 2D map.').waitFor()
  await page.locator('[data-testid="route-2d"]').first().waitFor()
  assert.equal(await page.evaluate(() => window.captures.length), 0)
  await btn('Return to 2D').click()
  assert.ok(await btn('Camera directions').evaluate(el => el === document.activeElement))
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.getByRole('button', { name: 'Route Preferences: Standard', exact: true }).filter({ visible: true }).first().click()
  await page.getByRole('radio', { name: 'Avoid Stairs', exact: true }).check()
  await btn('Apply preference').click()
  await page.getByText('No route that avoids stairs is available in the verified campus map.', { exact: false }).filter({ visible: true }).first().waitFor()
  assert.ok(await btn('Camera directions').isDisabled())
  console.log('PASS Avoid Stairs failure keeps camera disabled without falling back to a stair route')
  console.log('PASS missing language pack preserves typing; missing modal support preserves the active 2D route')
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
