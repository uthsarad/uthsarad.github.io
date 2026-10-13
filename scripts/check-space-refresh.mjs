#!/usr/bin/env node
/** Startup acceptance against an EXISTING production preview, never installs or starts servers.
 * node scripts/check-space-refresh.mjs --url http://127.0.0.1:4173 [--output directory]
 * --max-paint-ms 2000 asserts local paint timings. Use 0 to record live timings without a promise.
 * --bfcache attempts real restore separately, reporting BLOCKED unless persisted:true is observed.
 * --arrival-visual captures intro appearance separately, without timing acceptance claims.
 * PLAYWRIGHT_MODULE and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH match check-navigation.mjs.
 */
import assert from 'node:assert/strict'
import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const argv = process.argv.slice(2)
const option = (name, fallback) => argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback
const url = new URL(option('--url', 'http://127.0.0.1:4173')).href
const output = resolve(option('--output', join(tmpdir(), 'portfolio-space-refresh')))
const maxPaint = Number(option('--max-paint-ms', '2000'))
assert.ok(Number.isFinite(maxPaint) && maxPaint >= 0, '--max-paint-ms must be nonnegative')
const exists = (path) => access(path).then(() => true, () => false)
const list = (path) => readdir(path).catch(() => [])
async function tools() {
  const candidates = [process.env.PLAYWRIGHT_MODULE].filter(Boolean)
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try { candidates.push(require.resolve(name)) } catch { /* Try installed caches. */ }
  }
  for (const cache of [process.env.npm_config_cache, process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'npm-cache'), join(homedir(), '.npm')].filter(Boolean)) {
    for (const entry of await list(join(cache, '_npx')))
      for (const name of ['playwright', 'playwright-core']) candidates.push(join(cache, '_npx', entry, 'node_modules', name, 'index.mjs'))
  }
  for (let path of candidates) {
    if (await exists(join(path, 'index.mjs'))) path = join(path, 'index.mjs')
    if (!await exists(path)) continue
    const module = await import(pathToFileURL(resolve(path)).href)
    if (module.chromium) return { chromium: module.chromium, modulePath: resolve(path) }
  }
  throw new Error('No existing Playwright. Set PLAYWRIGHT_MODULE to index.mjs. No packages are installed.')
}
// Installed before navigation, before the early head script. Timing never starts at DCL/load.
function instrument({ paused = false, animationOff = false } = {}) {
  if (paused) localStorage.setItem('portfolio:motion-paused', 'true')
  const state = window.__spaceRefresh = { documentId: crypto.randomUUID(), samples: [], events: [], paints: [], lcp: [], longtasks: [], unsupported: [], firstVisible: null, firstHidden: null }
  const arrival = () => {
    const node = document.querySelector('.space-arrival')
    if (!node) return { present: false, visible: false, fullyHidden: true }
    const css = getComputedStyle(node)
    return { present: true, visible: css.display !== 'none' && css.visibility === 'visible' && Number(css.opacity) > 0, fullyHidden: css.opacity === '0' && css.visibility === 'hidden', opacity: Number(css.opacity), visibility: css.visibility, display: css.display, pointerEvents: css.pointerEvents }
  }
  for (const type of ['paint', 'largest-contentful-paint', 'longtask']) {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) { state.unsupported.push(type); continue }
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) {
        const value = { name: entry.name, startTime: entry.startTime, duration: entry.duration }
        if (type === 'largest-contentful-paint') Object.assign(value, { size: entry.size, url: entry.url, element: entry.element ? `${entry.element.tagName}#${entry.element.id}.${String(entry.element.className)}` : null })
        state[type === 'paint' ? 'paints' : type === 'longtask' ? 'longtasks' : 'lcp'].push(value)
      }
    }).observe({ type, buffered: true })
  }
  for (const type of ['pointerdown', 'keydown', 'wheel', 'pagehide', 'pageshow']) addEventListener(type, (event) => {
    state.events.push({ type, t: performance.now(), persisted: event.persisted ?? null, arrivalVisible: arrival().visible })
  }, { capture: true })
  if (animationOff) {
    const install = () => {
      if (!document.head) return false
      const style = document.createElement('style')
      style.textContent = '.space-arrival,.space-arrival *{animation:none!important}'
      document.head.append(style)
      return true
    }
    if (!install()) {
      const observer = new MutationObserver(() => { if (install()) observer.disconnect() })
      observer.observe(document, { childList: true, subtree: true })
    }
  }
  const sample = () => {
    const value = { t: performance.now(), ...arrival() }
    if (value.visible && state.firstVisible === null) state.firstVisible = value.t
    if (value.fullyHidden && state.firstVisible !== null && state.firstHidden === null) state.firstHidden = value.t
    state.samples.push(value)
    if (value.t < 12000) requestAnimationFrame(sample)
  }
  requestAnimationFrame(sample)
}
const { chromium, modulePath } = await tools()
const launch = { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(), headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
const browser = await chromium.launch(launch)
await mkdir(output, { recursive: true })
const report = { url, startedAt: new Date().toISOString(), browser: await browser.version(), modulePath, maxPaintMs: maxPaint, tests: [], limitations: [
  'Single lab navigation per performance condition, not field p75 or a universal network guarantee. Fonts and external failures retained separately.',
  'Latest LCP candidate observed through 5 seconds without input, not proof that no later candidate can occur. Software GPU, no CPU throttling.',
  'Timed startup completion cases never request a screenshot before the completion deadline. Capture follows 3s. --arrival-visual is separate untimed visual evidence, not a causal explanation for prior failures.',
  'Frame/computed-style observations plus screenshots, not every compositor frame. No-JS is checked after navigation because init scripts do not run.',
  'Contrast composites solid ancestor backgrounds. Gradients, sibling WebGL/images, shadows, pseudo-element scrims, and group opacity need pixel/manual review.',
  'BFCache is disabled by default in Playwright. --bfcache is an isolated best-effort attempt, never a synthetic event claim.'
] }
let failures = 0
const waitAt = (page, ms) => page.waitForFunction((deadline) => performance.now() >= deadline, ms)
const snapshot = (page) => page.evaluate(() => window.__spaceRefresh)
const opener = (page) => page.getByRole('button', { name: 'Open navigation', exact: true })
const hidden = (page) => page.locator('.space-arrival').evaluate((node) => { const css = getComputedStyle(node); return css.opacity === '0' && css.visibility === 'hidden' })
const expectedNoJsPreload = (entry, javaScriptEnabled, hrefs) => javaScriptEnabled === false && entry.phase === 'workflow' && entry.error === 'csp' && entry.resourceType === 'script' && !entry.external && hrefs.includes(entry.url)
async function test(name, options, check, setup = async () => {}, path = '/', seed = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const result = { name, javaScriptEnabled: options.javaScriptEnabled !== false, outcome: 'RUNNING', observations: [], pageErrors: [], failedRequests: [], httpErrors: [], screenshots: [] }
  report.tests.push(result)
  let phase = 'workflow'
  const note = (requirement, evidence) => result.observations.push({ requirement, evidence })
  page.on('pageerror', (error) => result.pageErrors.push(error.message))
  page.on('requestfailed', (request) => result.failedRequests.push({ url: request.url(), resourceType: request.resourceType(), error: request.failure()?.errorText, phase, external: new URL(request.url()).origin !== new URL(url).origin }))
  page.on('response', (response) => { if (response.status() >= 400) result.httpErrors.push({ url: response.url(), status: response.status(), external: new URL(response.url()).origin !== new URL(url).origin }) })
  const shot = async (suffix) => { const file = join(output, `${name}-${suffix}.png`); await page.screenshot({ path: file }); result.screenshots.push(file) }
  try {
    await page.addInitScript(instrument, seed)
    await setup(page, context, note)
    const response = await page.goto(new URL(path, url).href, { waitUntil: 'commit' })
    assert.equal(response?.status(), 200, 'Document must respond successfully')
    await check(page, note, shot, result)
    if (!name.includes('blocked')) assert.deepEqual(result.pageErrors, [], 'Unexpected application errors')
    result.documentModulePreloads = result.javaScriptEnabled === false ? await page.locator('link[rel~="modulepreload"][href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.href))]) : []
    result.expectedNoJsModulePreloadCsp = result.failedRequests.filter((entry) => expectedNoJsPreload(entry, result.javaScriptEnabled, result.documentModulePreloads))
    if (!result.javaScriptEnabled) note('exact document modulepreload CSP failures retained and classified separately', { hrefs: result.documentModulePreloads, classifiedFailures: result.expectedNoJsModulePreloadCsp })
    const workflowFailures = result.failedRequests.filter((entry) => entry.phase === 'workflow' && !entry.external && !result.expectedNoJsModulePreloadCsp.includes(entry))
    if (!name.includes('blocked')) assert.deepEqual(workflowFailures, [], 'Unexpected first-party request failures')
    assert.deepEqual(result.httpErrors.filter((entry) => !entry.external), [], 'Unexpected first-party HTTP errors')
    result.outcome = 'PASS'
    console.log('PASS', name)
  } catch (error) {
    failures++
    result.outcome = 'FAIL'
    result.error = error.stack
    await shot('failure').catch(() => {})
    console.error('FAIL', name, error.message)
  } finally {
    result.startup = await snapshot(page).catch(() => null)
    phase = 'teardown'
    await context.close()
    await writeFile(join(output, 'space-refresh.json'), JSON.stringify(report, null, 2) + '\n')
  }
}
async function completed(page, note, shot) {
  await page.waitForFunction(() => window.__spaceRefresh.firstVisible !== null, null, { timeout: 2000 })
  const active = await snapshot(page)
  assert.equal(await page.locator('.space-arrival').getAttribute('aria-hidden'), 'true')
  assert.equal(await page.locator('#root .space-arrival').count(), 0)
  assert.ok(active.samples.filter((frame) => frame.visible).every((frame) => frame.pointerEvents === 'none'))
  // Observe the exact deadline without GPU screenshot/readback. Visual capture is separate.
  await page.waitForFunction(() => window.__spaceRefresh.firstHidden !== null, null, { timeout: 2000 })
  const done = await snapshot(page)
  assert.ok(done.firstHidden < 2000, `Visible completion ${done.firstHidden}ms exceeds navigation-relative 2s`)
  await waitAt(page, 3000)
  assert.equal(await hidden(page), true)
  const final = await snapshot(page)
  assert.ok(final.samples.filter((frame) => frame.t >= done.firstHidden).every((frame) => !frame.visible), 'Intro reappeared after completion')
  note('visible startup completes within 2s and remains hidden at 3s', { firstVisibleMs: done.firstVisible, firstHiddenMs: done.firstHidden, visualDurationMs: done.firstHidden - done.firstVisible })
  await shot('complete')
}
async function skipped(page, note, shot) {
  await waitAt(page, 3000)
  assert.equal(await hidden(page), true)
  const state = await snapshot(page)
  assert.equal(state.firstVisible, null, 'Ineligible intro was visible')
  note('intro never shown for this eligibility/failure condition', { samples: state.samples.length, firstVisible: state.firstVisible })
  await shot('skipped')
}
// Solid CSS contrast only. Every sample stores caveats rather than pretending a canvas is a solid ancestor.
async function contrast(page, selectors) {
  return page.evaluate((selectors) => {
    const parse = (value) => {
      if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)) return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16)).concat(value.length === 9 ? parseInt(value.slice(7), 16) / 255 : 1)
      const numbers = value.match(/[\d.]+/g)?.map(Number)
      if (!numbers || !/^rgba?\(/.test(value)) throw new Error('Unsupported color: ' + value)
      return [...numbers.slice(0, 3), numbers[3] ?? 1]
    }
    const over = (front, back) => front.slice(0, 3).map((value, i) => value * front[3] + back[i] * (1 - front[3])).concat(1)
    const lum = (rgb) => rgb.slice(0, 3).map((n) => n / 255).map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0)
    const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
    const tokens = Object.fromEntries(['--bg', '--surface', '--surface-raised', '--text', '--muted', '--subtle', '--blue', '--on-blue', '--focus'].map((name) => [name, getComputedStyle(document.documentElement).getPropertyValue(name).trim()]))
    const accent = parse(tokens['--blue']), bluePosition = (accent[1] - accent[0]) / (accent[2] - accent[0])
    const palette = (rgb) => Math.max(...rgb.slice(0, 3)) - Math.min(...rgb.slice(0, 3)) <= 32 || rgb[2] > rgb[0] + 20 && rgb[2] > rgb[1] && Math.abs((rgb[1] - rgb[0]) / (rgb[2] - rgb[0]) - bluePosition) < 0.15
    const samples = selectors.map((selector) => {
      const node = document.querySelector(selector)
      if (!node) throw new Error('Missing contrast sample: ' + selector)
      const chain = [], caveats = []
      for (let element = node; element; element = element.parentElement) {
        const css = getComputedStyle(element)
        chain.unshift({ tag: element.tagName, background: css.backgroundColor })
        if (css.backgroundImage !== 'none' || Number(css.opacity) < 1 || css.mixBlendMode !== 'normal') caveats.push({ tag: element.tagName, image: css.backgroundImage, opacity: css.opacity, blend: css.mixBlendMode })
      }
      const background = chain.reduce((back, item) => over(parse(item.background), back), [0, 0, 0, 1])
      const css = getComputedStyle(node), foreground = over(parse(css.color), background)
      return { selector, text: node.textContent.trim().slice(0, 100), color: css.color, foreground, background, ratio: ratio(foreground, background), palette: palette(foreground) && palette(background), chain, caveats }
    })
    return { tokens, roleChecks: { darkBackground: lum(parse(tokens['--bg'])) < 0.025, lightText: lum(parse(tokens['--text'])) > 0.75, blueAccent: accent[2] > accent[0] + 50 && accent[2] > accent[1] }, tokenChecks: Object.entries(tokens).filter(([, value]) => /^#|^rgb/.test(value)).map(([name, value]) => ({ name, value, palette: palette(parse(value)) })), samples }
  }, selectors)
}
try {
  for (const width of [1440, 390, 320]) await test('startup-' + width, { viewport: { width, height: width === 1440 ? 900 : 844 }, hasTouch: width < 700, isMobile: width < 700 }, completed)
  for (const [name, options, path, seed] of [
    ['reduced', { reducedMotion: 'reduce' }, '/', {}], ['paused', {}, '/', { paused: true }],
    ['hash', {}, '/#projects', {}], ['standalone', {}, '/about/', {}], ['animation-disabled', {}, '/', { animationOff: true }]
  ]) await test(name, options, skipped, undefined, path, seed)
  await test('no-js', { javaScriptEnabled: false }, async (page, note, shot) => {
    await page.waitForLoadState('domcontentloaded')
    assert.equal(await hidden(page), true)
    await page.locator('.menu-fallback summary').click()
    await page.locator('.static-section-nav a[href="/#projects"]').click()
    assert.equal(new URL(page.url()).hash, '#projects')
    note('no-JS intro hidden and actual native section link works', { hash: new URL(page.url()).hash })
    await shot('native-links')
  })
  await test('entry-blocked', {}, async (page, note, shot, result) => {
    await completed(page, note, shot)
    assert.ok(result.observations.find((entry) => entry.requirement === 'failure simulation')?.evidence.count > 0, 'Need observed blocked modules')
    await page.locator('.menu-fallback summary').click()
    await page.locator('.static-section-nav a[href="/#projects"]').click()
    assert.equal(new URL(page.url()).hash, '#projects')
    note('entry modules blocked, CSS expires independently and static native links work', true)
  }, async (page, context, note) => {
    const evidence = { kind: 'all first-party module scripts blocked', count: 0 }
    note('failure simulation', evidence)
    await context.route('**/*', (route) => {
      if (route.request().resourceType() === 'script' && new URL(route.request().url()).origin === new URL(url).origin) { evidence.count++; return route.abort('blockedbyclient') }
      return route.continue()
    })
  })
  await test('css-slow', {}, async (page, note, shot) => {
    await waitAt(page, 3400)
    const state = await snapshot(page)
    assert.ok(state.samples.some((frame) => frame.t >= 2200 && frame.present), 'Need intro observations after delayed CSS release')
    assert.ok(state.samples.filter((frame) => frame.t >= 2000).every((frame) => !frame.visible), 'Intro appeared after deadline')
    assert.equal(await hidden(page), true)
    note('CSS delayed 2300ms, no late intro beyond navigation deadline', { firstVisible: state.firstVisible, lastFrame: state.samples.at(-1) })
    await shot('deadline')
  }, async (page, context) => { await context.route('**/*', async (route) => { if (route.request().resourceType() === 'stylesheet' && new URL(route.request().url()).origin === new URL(url).origin) await new Promise((done) => setTimeout(done, 2300)); await route.continue() }) })
  for (const touch of [false, true]) await test(touch ? 'touch-input' : 'pointer-input', touch ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } : {}, async (page, note, shot) => {
    await page.waitForFunction(() => window.__spaceRefresh.firstVisible !== null, null, { timeout: 2000 })
    await opener(page).waitFor()
    await opener(page)[touch ? 'tap' : 'click']({ timeout: 1000 })
    await page.waitForFunction(() => document.querySelector('#navigation-drawer').matches(':modal'))
    const state = await snapshot(page), input = state.events.find((event) => event.type === 'pointerdown')
    assert.equal(input?.arrivalVisible, true, 'Real input must occur while intro is visible, not after waiting it out')
    assert.equal(await hidden(page), true)
    note('actual unforced menu input during visible intro dismisses it and opens native modal', input)
    await shot('modal')
  })
  await test('keyboard-input', {}, async (page, note, shot) => {
    await page.waitForFunction(() => window.__spaceRefresh.firstVisible !== null, null, { timeout: 2000 })
    await page.keyboard.press('Tab')
    const state = await snapshot(page)
    assert.equal(state.events.find((event) => event.type === 'keydown')?.arrivalVisible, true)
    await opener(page).focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => document.querySelector('#navigation-drawer').matches(':modal'))
    assert.equal(await hidden(page), true)
    note('actual key input dismisses visible intro and keyboard menu remains usable', state.events)
    await shot('modal')
  })
  await test('pause-resume-history', {}, async (page, note, shot) => {
    await completed(page, note, shot)
    const token = (await snapshot(page)).documentId
    const motion = page.getByRole('switch', { name: 'Visual animations' })
    await motion.click()
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'off')
    await motion.click()
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'on')
    await opener(page).click()
    await page.locator('#primary-navigation a[href="/#projects"]').click()
    await page.waitForFunction(() => location.hash === '#projects')
    await page.evaluate(() => history.back())
    await page.waitForFunction(() => location.hash === '')
    assert.equal((await snapshot(page)).documentId, token)
    assert.equal(await hidden(page), true)
    note('pause/resume and same-document history do not rearm intro', { documentId: token, arrivalAttribute: await page.locator('html').getAttribute('data-arrival') })
    await shot('no-rerun')
  })
  await test('client-navigation', {}, async (page, note, shot) => {
    await opener(page).waitFor()
    const token = (await snapshot(page)).documentId
    await page.locator('.site-footer .wordmark').click()
    await page.waitForFunction(() => location.pathname === '/' && document.querySelector('#hero'))
    assert.equal((await snapshot(page)).documentId, token, 'Actual home link must retain the React document')
    assert.equal((await snapshot(page)).firstVisible, null, 'Client navigation armed a new intro')
    assert.equal(await hidden(page), true)
    note('actual standalone footer Home link retains the document without intro replay', { documentId: token })
    await shot('no-rerun')
  }, undefined, '/about/')
  await test('contrast', { reducedMotion: 'reduce' }, async (page, note, shot) => {
    await opener(page).waitFor()
    const content = await contrast(page, ['.hero-description', '.hero-copy .eyebrow', '.hero-aside p', '.button-primary', 'article p', 'article h3'])
    await opener(page).click()
    await page.waitForFunction(() => document.querySelector('#navigation-drawer').matches(':modal'))
    const navigation = await contrast(page, ['#navigation-title', '#primary-navigation a span:nth-child(2)', '.drawer-footer p'])
    note('actual computed palette and alpha-composited solid-ancestor text contrast', { content, navigation })
    for (const [name, valid] of Object.entries(content.roleChecks)) assert.equal(valid, true, `Palette role ${name} failed`)
    for (const entry of [...content.tokenChecks, ...navigation.tokenChecks]) assert.equal(entry.palette, true, `${entry.name} is neither neutral nor the main blue hue`)
    for (const entry of [...content.samples, ...navigation.samples]) { assert.equal(entry.palette, true, `${entry.selector} violates palette`); assert.ok(entry.ratio >= 4.5, `${entry.selector} contrast ${entry.ratio.toFixed(2)} < 4.5`) }
    await shot('navigation')
  })
  await test('blue-fallback', { reducedMotion: 'reduce' }, async (page, note, shot) => {
    await page.locator('.black-hole__fallback').waitFor({ state: 'attached' })
    const evidence = await page.evaluate(async () => {
      const image = document.querySelector('.black-hole__fallback')
      await image.decode()
      const source = new URL(image.currentSrc || image.src, location.href)
      if (source.origin !== location.origin) throw new Error('Fallback must be same-origin for actual pixel inspection')
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Fallback did not decode a real image')
      const temporary = document.createElement('canvas')
      temporary.width = image.naturalWidth
      temporary.height = image.naturalHeight
      const context = temporary.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      const data = context.getImageData(0, 0, temporary.width, temporary.height).data
      let brightChromatic = 0, blue = 0, warm = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], alpha = data[i + 3]
        const maximum = Math.max(r, g, b), minimum = Math.min(r, g, b)
        if (alpha < 200 || maximum < 60 || maximum - minimum < 32) continue
        brightChromatic++
        if (b > r + 20 && b > g + 8) blue++
        if (r >= 80 && r > b + 25 && r >= g - 10) warm++
      }
      const pixels = temporary.width * temporary.height
      const filters = { visual: getComputedStyle(document.querySelector('.black-hole__visual')).filter, fallback: getComputedStyle(image).filter, canvas: getComputedStyle(document.querySelector('.black-hole__canvas')).filter }
      return { source: source.href, width: temporary.width, height: temporary.height, pixels, brightChromatic, blue, warm, blueFraction: blue / pixels, warmFraction: warm / pixels, warmChromaticFraction: warm / Math.max(1, brightChromatic), filters, thresholds: { minimumBlueFraction: 0.002, maximumWarmFraction: 0.001, maximumWarmChromaticFraction: 0.01 } }
    })
    note('actual same-origin decoded fallback is blue/white, not materially golden; hue filter applies only to canvas', evidence)
    assert.ok(evidence.blueFraction >= evidence.thresholds.minimumBlueFraction, 'Decoded fallback lacks material bright blue pixels')
    assert.ok(evidence.warmFraction <= evidence.thresholds.maximumWarmFraction && evidence.warmChromaticFraction <= evidence.thresholds.maximumWarmChromaticFraction, 'Decoded fallback contains material warm/golden pixels')
    assert.equal(evidence.filters.visual, 'none', 'Visual wrapper must not recolor the already-blue fallback')
    assert.equal(evidence.filters.fallback, 'none', 'Blue fallback must remain unfiltered')
    assert.match(evidence.filters.canvas, /hue-rotate\(/, 'Only physical canvas receives hue rotation')
    await shot('decoded-blue')
  })
  for (const throttled of [false, true]) await test(throttled ? 'paint-fast4g-cold' : 'paint-normal-cold', { viewport: throttled ? { width: 390, height: 844 } : { width: 1440, height: 900 }, hasTouch: throttled, isMobile: throttled }, async (page, note, shot) => {
    await waitAt(page, 5000)
    const state = await snapshot(page), fcp = state.paints.find((entry) => entry.name === 'first-contentful-paint'), lcp = state.lcp.at(-1)
    const conditions = { coldCache: true, network: throttled ? '4,000,000 bits/s down and up, 40ms latency' : 'unthrottled', cpuThrottling: 'none', requestInterception: false, observationMs: 5000, userInput: false, navigationOrigin: new URL(url).origin }
    note('separate no-input FCP/LCP observations and main-thread long tasks', { conditions, fcp, lcp, longtasks: state.longtasks, unsupported: state.unsupported })
    assert.ok(fcp && lcp, 'Browser must report both paint metrics')
    assert.ok(state.events.every((event) => !['pointerdown', 'keydown', 'wheel'].includes(event.type)), 'Metrics cannot follow user input')
    if (maxPaint > 0) { assert.ok(fcp.startTime < maxPaint, `FCP ${fcp.startTime}ms exceeds ${maxPaint}`); assert.ok(lcp.startTime < maxPaint, `LCP ${lcp.startTime}ms exceeds ${maxPaint}`) }
    await shot('5s')
  }, async (page, context) => {
    const cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    if (throttled) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 40, downloadThroughput: 4000000 / 8, uploadThroughput: 4000000 / 8, connectionType: 'cellular4g' })
  })
  if (argv.includes('--arrival-visual')) await test('arrival-visual-only', {}, async (page, note, shot, result) => {
    result.measurementRole = 'untimed-visual-only'
    await page.waitForFunction(() => window.__spaceRefresh.firstVisible !== null, null, { timeout: 5000 })
    note('Independent intro screenshot, excluded from startup and paint timing claims', { timedAcceptance: false })
    await shot('arrival')
  })
  if (argv.includes('--bfcache')) {
    const alternate = await chromium.launch({ ...launch, ignoreDefaultArgs: ['--disable-back-forward-cache'] })
    const context = await alternate.newContext(), page = await context.newPage()
    const result = { name: 'actual-bfcache', outcome: 'BLOCKED', observations: [] }
    report.tests.push(result)
    let restored = false
    try {
      await page.addInitScript(instrument)
      await page.goto(url, { waitUntil: 'commit' })
      await page.waitForFunction(() => window.__spaceRefresh.firstVisible !== null, null, { timeout: 2000 })
      const token = (await snapshot(page)).documentId
      await page.goto(new URL('/about/', url).href, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => history.back())
      await page.waitForFunction((token) => window.__spaceRefresh?.documentId === token && window.__spaceRefresh.events.some((event) => event.type === 'pageshow' && event.persisted === true), token, { timeout: 6000 })
      restored = true
      const evidence = await snapshot(page)
      assert.ok(evidence.events.some((event) => event.type === 'pagehide' && event.arrivalVisible), 'Need an actual leave while intro is active')
      assert.equal(await hidden(page), true)
      const screenshot = join(output, 'actual-bfcache-restored.png')
      await page.screenshot({ path: screenshot })
      result.outcome = 'PASS'
      result.observations.push({ requirement: 'actual early-leave BFCache restore does not replay intro', evidence, screenshot })
    } catch (error) {
      result.reason = error.message
      if (restored) { result.outcome = 'FAIL'; failures++ }
      result.observations.push({ requirement: 'real BFCache acceptance', evidence: restored ? 'Real restore established but acceptance failed.' : 'Not established. Playwright lifecycle limitations or browser eligibility may prevent restore.' })
    }
    finally { await context.close(); await alternate.close() }
    console.log(result.outcome, result.name)
  }
} finally {
  await browser.close()
  report.finishedAt = new Date().toISOString()
  report.counts = { total: report.tests.length, passed: report.tests.filter((entry) => entry.outcome === 'PASS').length, failed: failures, blocked: report.tests.filter((entry) => entry.outcome === 'BLOCKED').length }
  report.outcome = failures ? 'FAIL' : report.counts.blocked ? 'PASS_WITH_BLOCKED_FOLLOWUP' : 'PASS'
  await writeFile(join(output, 'space-refresh.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ outcome: report.outcome, ...report.counts, report: join(output, 'space-refresh.json') }))
  if (failures) process.exitCode = 1
}
