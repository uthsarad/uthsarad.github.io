#!/usr/bin/env node
/**
 * Local acceptance checks for the persistent portfolio black-hole scene.
 *
 * Start a built preview separately, then run:
 *   node scripts/check-space-trip.mjs
 *   node scripts/check-space-trip.mjs --url http://127.0.0.1:4173 --output %TEMP%\space-trip
 *   node scripts/check-space-trip.mjs --probe
 *   node scripts/check-space-trip.mjs --only navigation,history,mobile
 *
 * Uses an existing local or npm/npx-cached Playwright installation. It never
 * installs packages, starts a server, edits application files, or commits.
 * Optional overrides: PLAYWRIGHT_MODULE, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
 * SPACE_TRIP_URL, SPACE_TRIP_OUTPUT.
 * The section-first menu is checked by check-sections.mjs. Legacy-route stress
 * tests below activate temporary real anchors to exercise the retained router.
 */
import assert from 'node:assert/strict'
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const argv = process.argv.slice(2)
const option = (name, fallback) => {
  const index = argv.indexOf(name)
  return index === -1 ? fallback : argv[index + 1]
}
const baseURL = option('--url', process.env.SPACE_TRIP_URL ?? 'http://127.0.0.1:4173')
const output = resolve(option('--output', process.env.SPACE_TRIP_OUTPUT ?? join(tmpdir(), 'space-trip')))
const only = new Set((option('--only', '') ?? '').split(',').map((value) => value.trim()).filter(Boolean))
const pages = JSON.parse(await readFile(new URL('../src/data/pages.json', import.meta.url), 'utf8'))
const routeOrder = ['home', 'projects', 'coursework', 'about', 'contact']
const timeout = 45000

const exists = async (path) => access(path).then(() => true, () => false)
const list = async (path) => readdir(path).catch(() => [])

async function findPlaywright() {
  const candidates = []
  if (process.env.PLAYWRIGHT_MODULE) candidates.push(process.env.PLAYWRIGHT_MODULE)
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try { candidates.push(require.resolve(name)) } catch { /* Try known caches next. */ }
  }
  const caches = [
    process.env.npm_config_cache,
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'npm-cache'),
    join(homedir(), '.npm'),
  ].filter(Boolean)
  for (const cache of caches) {
    for (const entry of await list(join(cache, '_npx'))) {
      for (const name of ['playwright', 'playwright-core']) {
        candidates.push(join(cache, '_npx', entry, 'node_modules', name))
        candidates.push(join(cache, '_npx', entry, 'node_modules', name, 'index.mjs'))
      }
    }
  }
  for (let path of candidates) {
    if (await exists(join(path, 'index.mjs'))) path = join(path, 'index.mjs')
    if (!(await exists(path))) continue
    const module = await import(pathToFileURL(resolve(path)).href)
    if (module.chromium) return { ...module, modulePath: resolve(path) }
  }
  throw new Error('No existing Playwright installation found. Set PLAYWRIGHT_MODULE to its index.mjs.')
}

async function findChromium(chromium) {
  const candidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, chromium.executablePath()].filter(Boolean)
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH ?? (process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'ms-playwright')
    : join(homedir(), '.cache', 'ms-playwright'))
  const versions = (await list(cache))
    .filter((name) => /^chromium-\d+$/.test(name))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
  for (const version of versions) {
    candidates.push(join(cache, version, 'chrome-win64', 'chrome.exe'))
    candidates.push(join(cache, version, 'chrome-linux', 'chrome'))
    candidates.push(join(cache, version, 'chrome-linux64', 'chrome'))
  }
  const present = await Promise.all(candidates.map(exists))
  const found = candidates.find((_, index) => present[index])
  assert.ok(found, 'No installed Chromium found. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.')
  return found
}

// Observe real WebGL calls, actual context-loss events, and transient DOM state.
// Nothing is replaced or faked; loss and restore run for real.
function instrument() {
  const state = window.__spaceTrip = {
    documentId: crypto.randomUUID(), phases: [], contexts: [], originalCanvas: null,
    recordPhase(value) { this.phases.push({ value: value ?? null, at: performance.now(), path: location.pathname }) },
  }
  const observeTransit = () => {
    if (!document.documentElement) return false
    new MutationObserver((records) => {
      for (let index = 0; index < records.length; index++) {
        const next = records[index + 1]
        // New value after this change is the next record's old value, or the live attribute.
        const value = next ? next.oldValue : document.documentElement.getAttribute('data-transit')
        state.recordPhase(value)
      }
    }).observe(document.documentElement, { attributes: true, attributeOldValue: true, attributeFilter: ['data-transit'] })
    return true
  }
  if (!observeTransit()) {
    const rootObserver = new MutationObserver(() => { if (observeTransit()) rootObserver.disconnect() })
    rootObserver.observe(document, { childList: true, subtree: true })
  }
  const contextFor = new WeakMap()
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (...args) {
    const context = originalGetContext.apply(this, args)
    if (context && /^webgl/.test(String(args[0])) && !contextFor.has(context)) {
      const record = { canvas: this, gl: context, kind: args[0], draws: 0, lost: 0, restored: 0 }
      contextFor.set(context, record)
      state.contexts.push(record)
      this.addEventListener('webglcontextlost', () => { record.lost++ })
      this.addEventListener('webglcontextrestored', () => { record.restored++ })
      for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        if (typeof context[method] !== 'function') continue
        const original = context[method]
        context[method] = function (...values) {
          record.draws++
          return original.apply(this, values)
        }
      }
    }
    return context
  }
}

const { chromium, modulePath } = await findPlaywright()
const executablePath = await findChromium(chromium)
const launchArgs = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const browser = await chromium.launch({ headless: !argv.includes('--headed'), executablePath, args: launchArgs })
const report = {
  startedAt: new Date().toISOString(), baseURL, output, modulePath, executablePath,
  browserVersion: browser.version(), launchArgs, renderer: null, tests: [], diagnostics: [], screenshots: [],
}
await mkdir(output, { recursive: true })
console.log(JSON.stringify({ modulePath, executablePath, browser: browser.version(), output }))

const blackHoleRecord = () => window.__spaceTrip.contexts.find((record) => record.canvas.matches('.black-hole canvas'))

async function shot(page, name) {
  const path = join(output, `${name}.png`)
  const phase = await page.evaluate(() => document.documentElement.dataset.transit ?? null).catch(() => null)
  await page.screenshot({ path, timeout, animations: 'allow' })
  report.screenshots.push({ name, path, phaseAtRequest: phase, url: page.url() })
  return path
}

// Decode a composited screenshot of a canvas region and measure warm/bright pixels.
async function canvasStats(page, selector) {
  const buffer = await page.locator(selector).screenshot({ timeout, animations: 'allow' })
  const base64 = buffer.toString('base64')
  return page.evaluate(async (data) => {
    const response = await fetch('data:image/png;base64,' + data)
    const bitmap = await createImageBitmap(await response.blob())
    const surface = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = surface.getContext('2d')
    context.drawImage(bitmap, 0, 0)
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data
    let warm = 0, bright = 0, maxLuma = 0
    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2]
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
      if (luma > maxLuma) maxLuma = luma
      if (luma > 20) bright++
      if (r - b > 12 && r > 36 && r >= g - 8) warm++
    }
    return { width: bitmap.width, height: bitmap.height, total: bitmap.width * bitmap.height, warm, bright, maxLuma }
  }, base64)
}

async function withPage(name, options, run) {
  const { reducedMotion = 'no-preference', mobile = false, missingAssets = false } = options
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion,
  })
  await context.addInitScript(instrument)
  const diagnostics = { name, errors: [], console: [], requestFailures: [], badResponses: [], phases: [], assetsBlocked: 0 }
  if (missingAssets) {
    await context.route('**/black-hole/*.dat', async (route) => {
      diagnostics.assetsBlocked++
      await route.abort()
    })
  }
  const page = await context.newPage()
  page.setDefaultTimeout(timeout)
  page.on('pageerror', (error) => diagnostics.errors.push({ message: error.message, stack: error.stack }))
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) diagnostics.console.push({ type: message.type(), text: message.text(), location: message.location() })
  })
  page.on('requestfailed', (request) => diagnostics.requestFailures.push({ url: request.url(), error: request.failure()?.errorText }))
  page.on('response', (response) => { if (response.status() >= 400) diagnostics.badResponses.push({ url: response.url(), status: response.status() }) })
  try {
    await run(page, diagnostics)
    assert.equal(diagnostics.errors.length, 0, `Uncaught JavaScript errors: ${JSON.stringify(diagnostics.errors)}`)
    const unexpected = diagnostics.console.filter((entry) => entry.type === 'error' &&
      !/fonts\.(googleapis|gstatic)\.com/.test(entry.location.url ?? '') &&
      !(missingAssets && /Failed to load resource|ERR_FAILED|black.?hole|\.dat|net::/i.test(entry.text)))
    assert.equal(unexpected.length, 0, `Unexpected console errors: ${JSON.stringify(unexpected)}`)
  } catch (error) {
    await shot(page, `${name}-failure`).catch(() => {})
    throw error
  } finally {
    diagnostics.phases = await page.evaluate(() => window.__spaceTrip?.phases ?? []).catch(() => [])
    diagnostics.finalState = await page.evaluate(() => ({
      path: location.pathname, hash: location.hash, focus: document.activeElement?.id, scrollY,
      motion: document.documentElement.dataset.motion, transit: document.documentElement.dataset.transit,
      title: document.title, h1: document.querySelector('#main h1')?.textContent?.trim() ?? null,
      mainInert: document.getElementById('main')?.inert ?? null,
      ready: document.querySelector('.black-hole')?.dataset.ready ?? null,
      fallbackOpacity: document.querySelector('.black-hole__fallback')
        ? getComputedStyle(document.querySelector('.black-hole__fallback')).opacity : null,
      canvasOpacity: document.querySelector('.black-hole__canvas')
        ? getComputedStyle(document.querySelector('.black-hole__canvas')).opacity : null,
      contexts: window.__spaceTrip?.contexts.map((record) => ({
        kind: record.kind, connected: record.canvas.isConnected, draws: record.draws,
        lost: record.lost, restored: record.restored, width: record.canvas.width, height: record.canvas.height,
      })),
    })).catch(() => null)
    report.diagnostics.push(diagnostics)
    await context.close()
  }
}

async function settled(page, id) {
  await page.waitForFunction(({ id, href }) => location.pathname === href &&
    document.querySelector(`#main.page-${id}`) &&
    !document.documentElement.hasAttribute('data-transit') &&
    document.getElementById('main')?.getAttribute('aria-busy') !== 'true', { id, href: pages[id].href }, { timeout })
  await page.locator('#main h1').first().waitFor({ state: 'visible' })
}

async function rendered(page, { drawsAbove = 0 } = {}) {
  await page.waitForFunction((floor) => {
    const element = document.querySelector('.black-hole')
    const record = window.__spaceTrip.contexts.find((entry) => entry.canvas.matches('.black-hole canvas'))
    return element?.dataset.ready === 'true' && !!record && record.draws > floor && !record.gl.isContextLost()
  }, drawsAbove, { timeout })
}

async function visit(page, id = 'home', { renderer = true } = {}) {
  const response = await page.goto(new URL(pages[id].href, baseURL).href, { waitUntil: 'domcontentloaded' })
  assert.equal(response.status(), 200, `${id} must return a deployable document`)
  await settled(page, id)
  await page.waitForFunction(() => ['on', 'off'].includes(document.documentElement.dataset.motion ?? ''))
  await page.locator('.black-hole').waitFor({ state: 'attached' })
  if (renderer) await rendered(page)
}

async function captureIdentity(page) {
  return page.evaluate(() => {
    window.__spaceTrip.originalCanvas = document.querySelector('.black-hole canvas')
    return window.__spaceTrip.documentId
  })
}

async function persistent(page, documentId) {
  const result = await page.evaluate(() => ({
    documentId: window.__spaceTrip.documentId,
    same: window.__spaceTrip.originalCanvas === document.querySelector('.black-hole canvas'),
    count: document.querySelectorAll('.black-hole canvas').length,
  }))
  assert.equal(result.documentId, documentId, 'Navigation must preserve the document')
  assert.equal(result.same, true, 'Navigation must preserve the exact black-hole canvas node')
  assert.equal(result.count, 1, 'Exactly one black-hole canvas must remain mounted')
}

async function activateRoute(page, href) {
  await page.evaluate((target) => {
    const anchor = document.createElement('a')
    anchor.href = target
    document.querySelector('.site-shell').append(anchor)
    anchor.click()
    anchor.remove()
  }, href)
}

async function clickRoute(page, id) {
  await activateRoute(page, pages[id].href)
}

async function phasesSince(page, start) {
  return page.evaluate((from) => window.__spaceTrip.phases.slice(from), start)
}

async function phaseCount(page) {
  return page.evaluate(() => window.__spaceTrip.phases.length)
}

function expectedTitle(id) {
  return `${id === 'home' ? 'Portfolio' : pages[id].label} | Uthsara Dahanaike`
}

async function test(name, run) {
  if (only.size && !only.has(name)) return
  const started = Date.now()
  console.log(`START ${name}`)
  try {
    await run()
    report.tests.push({ name, status: 'passed', durationMs: Date.now() - started })
    console.log(`PASS ${name}`)
  } catch (error) {
    report.tests.push({ name, status: 'failed', durationMs: Date.now() - started, error: error.message, stack: error.stack })
    console.error(`FAIL ${name}: ${error.message}`)
  }
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
}

try {
  const probe = await browser.newPage()
  report.renderer = await probe.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    const debug = gl?.getExtension('WEBGL_debug_renderer_info')
    return { webgl2: !!gl, renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null, contextLossAvailable: !!gl?.getExtension('WEBGL_lose_context') }
  })
  await probe.close()
  assert.equal(report.renderer.webgl2, true, 'Real WebGL2 must be available')
  assert.equal(report.renderer.contextLossAvailable, true, 'Real WEBGL_lose_context extension must be available')
  console.log(JSON.stringify(report.renderer))

  if (!argv.includes('--probe')) {
    const response = await fetch(baseURL, { signal: AbortSignal.timeout(10000) })
    assert.equal(response.status, 200, 'Start a ready local preview before running acceptance checks')

    await test('navigation', () => withPage('navigation', {}, async (page) => {
      await visit(page)
      const identity = await captureIdentity(page)
      assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), 'on')
      await shot(page, 'home')
      const stats = await canvasStats(page, '.black-hole canvas')
      report.diagnostics.push({ name: 'canvas-stats-home', ...stats })
      console.log(`canvas home ${JSON.stringify(stats)}`)
      assert.ok(stats.maxLuma > 24, `Black-hole canvas must not be all black: ${JSON.stringify(stats)}`)
      assert.ok(stats.warm > 200 && stats.warm / stats.total > 0.001, `Black-hole canvas must show a warm disc: ${JSON.stringify(stats)}`)
      assert.equal(await page.locator('#main h1').count(), 1)

      // Home -> Projects: ordered transit states, updates, focus, and persistence.
      const start = await phaseCount(page)
      const homeH1 = await page.locator('#main h1').textContent()
      await clickRoute(page, 'projects')
      await page.waitForFunction(() => document.documentElement.dataset.transit === 'ingesting', null, { timeout })
      await page.waitForTimeout(280)
      await shot(page, 'mid-ingest')
      // Software-rendered screenshots can outlast a phase, so wait on the recorded log.
      await page.waitForFunction((from) => window.__spaceTrip.phases.slice(from).some((entry) => entry.value === 'emerging'), start, { timeout })
      await page.waitForTimeout(240)
      await shot(page, 'mid-emerge')
      await settled(page, 'projects')
      const phases = await phasesSince(page, start)
      const values = phases.map((entry) => entry.value)
      const order = values.filter((value) => value !== null)
      assert.deepEqual(order, ['ingesting', 'swapping', 'emerging'], `Transit states must be ordered: ${JSON.stringify(phases)}`)
      assert.equal(values[values.length - 1], null, 'data-transit must be removed at the end')
      const span = phases[phases.length - 1].at - phases[0].at
      assert.ok(span <= 3000, `Transit must settle quickly (~1.5s): ${span}ms`)
      assert.equal(new URL(page.url()).pathname, '/projects/', 'URL updates after transit')
      // The tab follows reading topics, so the first card row can already show
      // FerrumCalc here. Preview the real destination heading for an exact title
      // check without forcing document.title or changing main's keyboard focus.
      const readingTitle = await page.title()
      await page.locator('#main h1 .topic-title').hover()
      await page.waitForFunction((title) => document.title === title, expectedTitle('projects'), { timeout })
      assert.equal(await page.title(), expectedTitle('projects'), 'Destination heading previews the correct document title')
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      assert.equal(canonical, 'https://uthsarad.github.io' + pages.projects.href, 'Canonical metadata reflects the destination route, not a reading topic')
      report.diagnostics.push({ name: 'navigation-titles', readingTitle, headingTitle: await page.title(), canonical })
      const projectsH1 = await page.locator('#main h1').textContent()
      assert.ok(projectsH1.trim().length > 0 && projectsH1 !== homeH1, 'h1 reflects the destination page')
      assert.equal(await page.locator('#main').evaluate((main) => document.activeElement === main), true, 'main is focused after transit')
      assert.equal(await page.locator('#main').evaluate((main) => main.inert), false, 'main is not inert after transit')
      assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false, 'No stuck data-transit')
      await persistent(page, identity)
      await shot(page, 'projects')
    }))

    await test('escape', () => withPage('escape', {}, async (page) => {
      await visit(page)
      const identity = await captureIdentity(page)
      await clickRoute(page, 'projects')
      await page.waitForFunction(() => document.documentElement.hasAttribute('data-transit'), null, { timeout })
      await page.keyboard.press('Escape')
      await settled(page, 'projects')
      assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false, 'Escape leaves no stuck data-transit')
      assert.equal(await page.locator('#main').evaluate((main) => main.inert), false, 'Escape restores main inert state')
      assert.equal(await page.locator('#main').evaluate((main) => document.activeElement === main), true, 'main focused after Escape-skipped transit')
      await persistent(page, identity)
    }))

    await test('history', () => withPage('history', {}, async (page) => {
      await visit(page, 'projects')
      const identity = await captureIdentity(page)
      const setScroll = async (wanted) => {
        const actual = await page.evaluate((top) => {
          const y = Math.min(top, document.documentElement.scrollHeight - innerHeight)
          window.scrollTo({ top: y, behavior: 'instant' })
          return y
        }, wanted)
        assert.ok(actual > 150, 'Fixture page must have a meaningful reading position')
        await page.waitForFunction((target) => Math.abs(scrollY - target) < 3, actual)
        return actual
      }
      const projectY = await setScroll(620)
      // Activate an anchor in place without disturbing the departure offset.
      const activate = (href) => activateRoute(page, href)
      await activate(pages.coursework.href)
      await settled(page, 'coursework')
      const courseworkY = await setScroll(450)
      await activate(pages.about.href)
      await settled(page, 'about')
      await page.goBack()
      await settled(page, 'coursework')
      await page.waitForFunction((y) => Math.abs(scrollY - y) < 5, courseworkY)
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main', 'Back focuses main')
      await page.goBack()
      await settled(page, 'projects')
      await page.waitForFunction((y) => Math.abs(scrollY - y) < 5, projectY)
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main', 'Back focuses main')
      await page.goForward()
      await settled(page, 'coursework')
      await page.waitForFunction((y) => Math.abs(scrollY - y) < 5, courseworkY)
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'main', 'Forward focuses main')
      await persistent(page, identity)
    }))

    await test('back-mid-trip', () => withPage('back-mid-trip', {}, async (page) => {
      await visit(page, 'about')
      const identity = await captureIdentity(page)
      // Back while the outgoing page is still falling in must leave URL and content agreeing.
      await clickRoute(page, 'projects')
      await page.waitForFunction(() => document.documentElement.dataset.transit === 'ingesting', null, { timeout })
      await page.goBack()
      await settled(page, 'about')
      await page.waitForTimeout(1600)
      const state = await page.evaluate(() => ({ path: location.pathname, projects: !!document.querySelector('#main.page-projects') }))
      assert.deepEqual(state, { path: '/about/', projects: false }, 'URL and rendered page agree after Back mid-trip')
      await page.goForward()
      await settled(page, 'projects')
      await persistent(page, identity)
    }))

    await test('rapid', () => withPage('rapid', {}, async (page) => {
      await visit(page, 'projects')
      const identity = await captureIdentity(page)
      // DOM clicks intentionally bypass actionability waits to stress overlapping
      // requests in one event turn, as repeated keyboard/pointer input can do.
      await page.evaluate(() => {
        for (const href of ['/about/', '/contact/', '/about/', '/contact/']) {
          const anchor = document.createElement('a')
          anchor.href = href
          document.querySelector('.site-shell').append(anchor)
          anchor.click()
          anchor.remove()
        }
      })
      await settled(page, 'contact')
      assert.equal(new URL(page.url()).pathname, '/contact/', 'Rapid clicks end on the last target')
      await persistent(page, identity)
      await page.waitForTimeout(1400)
      await settled(page, 'contact')
      assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false, 'No stuck data-transit after rapid clicks')
      assert.equal(await page.locator('#main').evaluate((main) => main.inert), false, 'main not inert after rapid clicks')
      assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).isVisible().catch(() => false), true)
      await page.goBack()
      await settled(page, 'projects')
      await persistent(page, identity)
    }))

    await test('motion-switch', () => withPage('motion-switch', {}, async (page) => {
      await visit(page)
      const identity = await captureIdentity(page)
      const toggle = page.getByRole('switch', { name: 'Visual animations' })
      await toggle.click()
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'off')
      assert.equal(await toggle.getAttribute('aria-checked'), 'false')
      assert.equal(await page.evaluate(() => localStorage.getItem('portfolio:motion-paused')), 'true')
      const start = await phaseCount(page)
      await clickRoute(page, 'projects')
      await settled(page, 'projects')
      const phases = await phasesSince(page, start)
      assert.ok(phases.every((entry) => entry.value === null), `Motion-off navigation must skip transit: ${JSON.stringify(phases)}`)
      assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false)
      await persistent(page, identity)
      // Restore and confirm the choreography comes back.
      await toggle.click()
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'on')
      const resumed = await phaseCount(page)
      await clickRoute(page, 'about')
      await settled(page, 'about')
      assert.ok((await phasesSince(page, resumed)).some((entry) => /ingest/.test(entry.value ?? '')), 'Transit resumes when motion is re-enabled')
    }))

    await test('reduced-motion', () => withPage('reduced-motion', { reducedMotion: 'reduce' }, async (page) => {
      await visit(page, 'home', { renderer: false })
      assert.equal(await page.evaluate(() => document.documentElement.dataset.motion), 'off')
      const toggle = page.getByRole('switch', { name: 'Visual animations' })
      assert.equal(await toggle.isDisabled(), true, 'Motion switch is locked under reduced motion')
      const identity = await captureIdentity(page)
      for (const id of ['projects', 'coursework', 'about', 'contact', 'home']) {
        const start = await phaseCount(page)
        await clickRoute(page, id)
        await settled(page, id)
        const phases = await phasesSince(page, start)
        assert.ok(phases.every((entry) => entry.value === null), `Reduced motion must skip transit entirely: ${JSON.stringify(phases)}`)
        assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false)
        assert.equal(new URL(page.url()).pathname, pages[id].href, `Reduced-motion navigation reaches ${id}`)
      }
      await persistent(page, identity)
    }))

    await test('mobile', () => withPage('mobile', { mobile: true }, async (page) => {
      await visit(page)
      const identity = await captureIdentity(page)
      await shot(page, 'mobile')
      const menu = page.locator('button[aria-controls="navigation-drawer"]')
      await menu.click()
      assert.equal(await menu.getAttribute('aria-expanded'), 'true')
      await page.keyboard.press('Escape')
      assert.equal(await menu.getAttribute('aria-expanded'), 'false', 'Escape closes the mobile navigation')
      for (const id of ['projects', 'coursework', 'about', 'contact', 'home']) {
        await clickRoute(page, id)
        await settled(page, id)
        assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).getAttribute('aria-expanded'), 'false')
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile page must not overflow horizontally')
        await persistent(page, identity)
      }
      await shot(page, 'mobile-after')
    }))

    await test('context-loss', () => withPage('context-loss', {}, async (page) => {
      await visit(page)
      const identity = await captureIdentity(page)
      const before = await page.evaluate(() => {
        const record = window.__spaceTrip.contexts.find((entry) => entry.canvas.matches('.black-hole canvas') && entry.draws > 0)
        window.__spaceTrip.loss = record
        window.__spaceTrip.lossExt = record.gl.getExtension('WEBGL_lose_context')
        const draws = record.draws
        window.__spaceTrip.lossExt.loseContext()
        return draws
      })
      await page.waitForFunction(() => window.__spaceTrip.loss.lost > 0 && window.__spaceTrip.loss.gl.isContextLost())
      await shot(page, 'context-lost')
      assert.equal(await page.evaluate(() => document.querySelectorAll('.black-hole canvas').length), 1, 'Canvas survives context loss')
      await page.evaluate(() => window.__spaceTrip.lossExt.restoreContext())
      await page.waitForFunction(() => window.__spaceTrip.loss.restored > 0 && !window.__spaceTrip.loss.gl.isContextLost(), null, { timeout })
      await rendered(page, { drawsAbove: before })
      assert.equal(await page.evaluate(() => document.querySelector('.black-hole')?.dataset.ready), 'true', 'Rendering resumes after context restore')
      await persistent(page, identity)
      // Still fully navigable after the loss/restore cycle.
      await clickRoute(page, 'projects')
      await settled(page, 'projects')
      await persistent(page, identity)
      await shot(page, 'context-restored')
    }))

    await test('missing-assets', () => withPage('missing-assets', { missingAssets: true }, async (page, diagnostics) => {
      await visit(page, 'home', { renderer: false })
      await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.black-hole__fallback')).opacity) > 0.9, null, { timeout })
      assert.ok(diagnostics.assetsBlocked > 0, 'Missing-assets test must actually block a renderer asset')
      assert.equal(await page.evaluate(() => document.querySelector('.black-hole')?.dataset.ready), 'false', 'Renderer stays unavailable without data files')
      assert.equal(await page.evaluate(() => Number(getComputedStyle(document.querySelector('.black-hole__canvas')).opacity) < 0.1), true, 'Canvas stays hidden when the renderer cannot load')
      assert.equal(await page.locator('.black-hole__fallback').isVisible(), true, 'Fallback image is visible without data files')
      await shot(page, 'missing-assets')
      await clickRoute(page, 'projects')
      await settled(page, 'projects')
      assert.equal(await page.locator('.black-hole__fallback').isVisible(), true, 'Fallback image survives navigation')
      await clickRoute(page, 'contact')
      await settled(page, 'contact')
      assert.equal(await page.locator('#main a[href^="mailto:"]').count() > 0, true, 'Navigation still works without renderer assets')
      assert.equal(await page.evaluate(() => document.documentElement.hasAttribute('data-transit')), false, 'No stuck transit without renderer assets')
    }))
  }
} catch (error) {
  report.fatal = { message: error.message, stack: error.stack }
  console.error(error)
} finally {
  report.finishedAt = new Date().toISOString()
  report.summary = {
    passed: report.tests.filter((entry) => entry.status === 'passed').length,
    failed: report.tests.filter((entry) => entry.status === 'failed').length,
    fatal: Boolean(report.fatal),
  }
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  console.log(`REPORT ${join(output, 'report.json')}`)
  console.log(JSON.stringify(report.summary))
  process.exitCode = report.summary.failed || report.summary.fatal ? 1 : 0
}
