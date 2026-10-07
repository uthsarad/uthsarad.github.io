#!/usr/bin/env node
/** Section-first acceptance checks. Start a built preview separately, then run
 * node scripts/check-sections.mjs --url http://127.0.0.1:4173
 * Optional --output directory, --headed, --only desktop,mobile,narrow,reduced-motion,no-js,routes.
 * Uses existing Playwright/browser caches only. No installs or server startup.
 * Heavy WebGL rendering and context-loss checks remain in check-space-trip.mjs.
 */
import assert from 'node:assert/strict'
import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
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
const baseURL = option('--url', process.env.SECTIONS_URL ?? 'http://127.0.0.1:4173')
const output = resolve(option('--output', process.env.SECTIONS_OUTPUT ?? join(tmpdir(), 'portfolio-sections')))
const only = new Set(option('--only', '').split(',').filter(Boolean))
const sections = ['hero', 'interests', 'projects', 'coursework', 'about', 'contact']
const exists = async (path) => access(path).then(() => true, () => false)
const list = async (path) => readdir(path).catch(() => [])

// Keep these fallbacks aligned with check-space-trip.mjs. No package installation.
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

function instrument() {
  window.__sections = { phases: [], canvas: null, scrollCalls: [] }
  const originalScroll = Element.prototype.scrollIntoView
  Element.prototype.scrollIntoView = function (options) {
    window.__sections.scrollCalls.push({ id: this.id, behavior: options?.behavior ?? null })
    return originalScroll.call(this, options)
  }
  const observe = () => {
    if (!document.documentElement) return false
    new MutationObserver((records) => {
      records.forEach((record, index) => window.__sections.phases.push(
        records[index + 1]?.oldValue ?? document.documentElement.getAttribute('data-transit'),
      ))
    }).observe(document.documentElement, { attributes: true, attributeOldValue: true, attributeFilter: ['data-transit'] })
    return true
  }
  if (!observe()) {
    const observer = new MutationObserver(() => { if (observe()) observer.disconnect() })
    observer.observe(document, { childList: true, subtree: true })
  }
}
const report = { startedAt: new Date().toISOString(), baseURL, output, tests: [], screenshots: [], assumptions: [
  'Native dialog #navigation-drawer, nav #primary-navigation and exact Open navigation / Close navigation names.',
  'Category group Filter projects by category. Status group or select Filter projects by (lifecycle )?status.',
  'Lifecycle badges .project-lifecycle.is-ongoing/completed/unknown, confirmed by Showcase worker.',
  'Backdrop dismissal tested outside dialog bounding box. Native modal inertness checked by rejecting background focus.',
] }
await mkdir(output, { recursive: true })
let browser
let activeResult
async function shot(page, name) {
  const path = join(output, `${name}.png`)
  await page.screenshot({ path, fullPage: true, timeout: 15000, animations: 'disabled' })
  report.screenshots.push(path)
}
async function heroShot(page, name) {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.black-hole canvas')
    return document.querySelector('.black-hole')?.dataset.ready === 'true' && canvas && Number(getComputedStyle(canvas).opacity) >= 0.99
  }, null, { timeout: 45000 })
  // Sample a composited canvas screenshot, as the retained renderer suite does.
  // Reading the WebGL drawing buffer directly can see a cleared frame instead.
  const buffer = await page.locator('.black-hole canvas').screenshot({ timeout: 15000, animations: 'allow' })
  const stats = await page.evaluate(async (data) => {
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
      maxLuma = Math.max(maxLuma, luma)
      if (luma > 20) bright++
      if (r - b > 12 && r > 36 && r >= g - 8) warm++
    }
    return { width: bitmap.width, height: bitmap.height, total: bitmap.width * bitmap.height, warm, bright, maxLuma }
  }, buffer.toString('base64'))
  activeResult.heroCanvas = stats
  assert.ok(stats.maxLuma > 24, `Hero canvas must not be all black: ${JSON.stringify(stats)}`)
  assert.ok(stats.warm > 200 && stats.warm / stats.total > 0.001, `Hero canvas must show a warm disc: ${JSON.stringify(stats)}`)
  await cleanLayout(page)
  await shot(page, `${name}-hero`)
  const path = join(output, `${name}-hero-viewport.png`)
  await page.screenshot({ path, fullPage: false, timeout: 15000, animations: 'disabled' })
  report.screenshots.push(path)
  activeResult.heroViewport = page.viewportSize()
}
async function cleanLayout(page) {
  const result = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((node) => node.id)
    return { duplicate: ids.filter((id, index) => ids.indexOf(id) !== index), overflow: document.documentElement.scrollWidth - innerWidth }
  })
  activeResult.layouts.push({ url: page.url(), ...result })
  assert.deepEqual(result.duplicate, [], 'Duplicate document IDs')
  assert.ok(result.overflow <= 1, `Horizontal overflow: ${result.overflow}px`)
}
async function settledSection(page, id, focus = true) {
  const timeout = 15000
  const deadline = Date.now() + timeout
  let previousY = NaN
  let stableSince = Date.now()
  let state
  // waitForFunction's page-side polling does not run with javaScriptEnabled:false.
  // Evaluate the actual DOM from Node instead, retaining the same expectations.
  while (Date.now() < deadline) {
    state = await page.evaluate((id) => {
      const target = document.getElementById(id)
      const rect = target?.getBoundingClientRect()
      return {
        hash: location.hash, path: location.pathname,
        focus: document.activeElement?.outerHTML?.slice(0, 180),
        focused: !!target && (document.activeElement === target || target.contains(document.activeElement)),
        scrollY, rect: rect ? { top: rect.top, bottom: rect.bottom } : null, height: innerHeight,
        expectedY: rect ? Math.min(Math.max(0, rect.top + scrollY - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)), Math.max(0, document.documentElement.scrollHeight - innerHeight)) : null,
      }
    }, id)
    const now = Date.now()
    const ready = state.hash === '#' + id && state.rect && Math.abs(state.scrollY - state.expectedY) <= 2 && state.rect.top < state.height && state.rect.bottom > 0 && (!focus || state.focused)
    if (!ready || Math.abs(previousY - state.scrollY) >= 1 || !Number.isFinite(previousY)) stableSince = now
    previousY = state.scrollY
    if (ready && now - stableSince >= 300) {
      activeResult.sections.push({ id, expectsFocus: focus, stableMs: now - stableSince, ...state })
      return
    }
    await new Promise((resolve) => setTimeout(resolve, Math.min(100, Math.max(0, deadline - now))))
  }
  throw new Error(`Section settling timed out after ${timeout}ms: expected ${id}, focus=${focus}, state=${JSON.stringify(state)}`)
}
async function menu(page) {
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true })
  await trigger.click()
  await page.waitForFunction(() => document.querySelector('#navigation-drawer')?.matches(':modal'))
  return page.locator('#navigation-drawer')
}
async function navigateSection(page, id) {
  const drawer = await menu(page)
  await drawer.locator(`#primary-navigation a[href="/#${id}"]`).click()
  await settledSection(page, id)
  assert.equal(await drawer.evaluate((node) => node.open), false)
}
async function filterStatus(page, label, collection = 'projects') {
  const name = new RegExp(`Filter ${collection} by (lifecycle )?status`, 'i')
  const select = page.getByRole('combobox', { name })
  if (await select.count()) await select.selectOption({ label })
  else await page.getByRole('group', { name }).getByRole('button', { name: label, exact: true }).click()
}
async function checkHome(page, name, reducedMotion) {
  await page.goto(baseURL + '/')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor()
  assert.deepEqual(await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.id)), sections)
  assert.equal(await page.locator('main h1').count(), 1)
  assert.equal(await page.locator('main article').count(), 8)
  for (const id of sections.slice(1)) assert.ok(await page.locator(`#${id} h2`).count(), `${id} needs h2`)
  const anchors = await page.locator('a[href]').evaluateAll((nodes) => nodes.map((node) => ({ href: node.href, target: node.hash && node.origin === location.origin && node.pathname === location.pathname ? !!document.getElementById(decodeURIComponent(node.hash.slice(1))) : true })))
  assert.deepEqual(anchors.filter((anchor) => !anchor.target), [], 'Local anchors need real targets')
  await cleanLayout(page)
  await page.waitForFunction(() => document.querySelector('.black-hole canvas'), null, { timeout: 45000 })
  if (name === 'desktop' || name === 'mobile') await heroShot(page, name)
  await page.evaluate(() => { window.__sections.canvas = document.querySelector('.black-hole canvas'); window.__sections.phases = []; window.__sections.scrollCalls = [] })
  const drawer = await menu(page)
  await page.getByRole('button', { name: 'Close navigation', exact: true }).waitFor()
  assert.equal(await page.evaluate(() => document.querySelector('#navigation-drawer').contains(document.activeElement)), true)
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab')
    // Chromium may cycle through browser chrome between the last and first
    // modal controls. That makes BODY active, but never a background control.
    assert.equal(await drawer.evaluate((node) => node.contains(document.activeElement) || document.activeElement === document.body), true, 'Tab reached a background control')
  }
  await page.getByRole('button', { name: 'Close navigation', exact: true }).focus()
  await page.locator('main').evaluate((node) => node.focus())
  assert.equal(await drawer.evaluate((node) => node.contains(document.activeElement)), true, 'Background accepted focus while modal')
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('#navigation-drawer').open)
  assert.equal(await page.getByRole('button', { name: 'Open navigation', exact: true }).evaluate((node) => document.activeElement === node), true)
  await menu(page)
  const box = await drawer.boundingBox()
  const viewport = page.viewportSize()
  const point = box.x > 1 ? { x: 0, y: viewport.height / 2 } : box.x + box.width < viewport.width - 1
    ? { x: viewport.width - 1, y: viewport.height / 2 } : { x: viewport.width / 2, y: viewport.height - 1 }
  assert.ok(point.x < box.x || point.x > box.x + box.width || point.y < box.y || point.y > box.y + box.height, 'No clickable backdrop area')
  await page.mouse.click(point.x, point.y)
  await page.waitForFunction(() => !document.querySelector('#navigation-drawer').open)
  // Check the close control separately from Escape/backdrop.
  await menu(page)
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click()
  // A close event queued by one opening must not close the next opening.
  await menu(page)
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click()
  await menu(page)
  await page.waitForTimeout(100)
  assert.equal(await drawer.evaluate((node) => node.matches(':modal')), true, 'Rapid reopen was closed by stale event')
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click()
  activeResult.checks.drawer = { initialFocusInside: true, tabFocusContained: true, backgroundFocusRejected: true, escapeAndReturnFocus: true, backdrop: true, closeButton: true, rapidReopen: true }
  for (const id of sections) await navigateSection(page, id)
  assert.equal(await page.evaluate(() => window.__sections.canvas === document.querySelector('.black-hole canvas')), true, 'Section anchors remounted canvas')
  assert.deepEqual(await page.evaluate(() => window.__sections.phases.filter((phase) => phase && phase !== 'idle')), [], 'Same-document anchors started black-hole transit')
  activeResult.checks.scene = { sameCanvas: true, sectionTransitPhases: [] }
  const calls = await page.evaluate(() => window.__sections.scrollCalls.filter((call) => ['hero', 'interests', 'projects', 'coursework', 'about', 'contact'].includes(call.id)))
  for (const id of sections) assert.ok(calls.some((call) => call.id === id && (reducedMotion ? call.behavior !== 'smooth' : call.behavior === 'smooth')), `${id} needs motion-aware scrolling`)
  const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
  report.testsScrollBehavior ??= {}
  report.testsScrollBehavior[name] = scrollBehavior
  if (reducedMotion) assert.notEqual(scrollBehavior, 'smooth', 'Reduced motion must not force smooth scroll')
  activeResult.checks.scrolling = { reducedMotion, scrollBehavior, calls }
  await navigateSection(page, 'projects')
  await navigateSection(page, 'about')
  await page.goBack()
  await settledSection(page, 'projects')
  await page.goForward()
  await settledSection(page, 'about')
  await page.reload()
  await settledSection(page, 'about')
  activeResult.checks.history = { backToProjects: true, forwardToAbout: true, reloadAbout: true }
  await page.goto(baseURL + '/#projects')
  await settledSection(page, 'projects')
  activeResult.checks.initialDeepLink = { hash: '#projects', focusedAndVisible: true }
  await navigateSection(page, 'projects')
  const category = page.getByRole('group', { name: 'Filter projects by category', exact: true })
  await category.getByRole('button', { name: /^Systems/ }).click()
  await filterStatus(page, 'Ongoing')
  await page.waitForFunction(() => document.querySelectorAll('#projects-grid article').length === 1)
  assert.match(await page.locator('#projects-grid').innerText(), /NeOS/)
  assert.equal(await category.getByRole('button', { name: /^Systems/ }).getAttribute('aria-pressed'), 'true')
  assert.equal(await page.locator('#coursework-grid article').count(), 3, 'Project category/status changed coursework')
  const academicCategory = page.getByRole('group', { name: 'Filter coursework by category', exact: true })
  await academicCategory.getByRole('button', { name: /^Data \+ AI/ }).click()
  await filterStatus(page, 'Status not confirmed', 'coursework')
  await page.waitForFunction(() => document.querySelectorAll('#coursework-grid article').length === 1)
  assert.match(await page.locator('#coursework-grid').innerText(), /Osteoporosis Detection/)
  assert.equal(await page.locator('#projects-grid article').count(), 1, 'Coursework filters changed project results')
  assert.match(await page.locator('#projects-grid').innerText(), /NeOS/)
  assert.equal(await category.getByRole('button', { name: /^Systems/ }).getAttribute('aria-pressed'), 'true')
  assert.equal(await page.getByRole('combobox', { name: /Filter projects by (lifecycle )?status/i }).inputValue(), 'ongoing')
  await filterStatus(page, 'Completed', 'coursework')
  await page.waitForFunction(() => document.querySelectorAll('#coursework-grid article').length === 0)
  assert.match(await page.locator('#coursework-grid').innerText(), /No coursework match/i)
  assert.match(await page.locator('#coursework [role="status"]').innerText(), /^0 studies/)
  assert.equal(await page.locator('#projects-grid article').count(), 1, 'Empty coursework result changed project results')
  await academicCategory.getByRole('button', { name: /^All coursework/ }).click()
  await filterStatus(page, 'All statuses', 'coursework')
  await page.waitForFunction(() => document.querySelectorAll('#coursework-grid article').length === 3)
  await filterStatus(page, 'Status not confirmed')
  await page.waitForFunction(() => document.querySelectorAll('#projects-grid article').length === 0)
  assert.match(await page.locator('#projects-grid').innerText(), /No projects match/i)
  assert.match(await page.locator('#projects [role="status"]').innerText(), /^0 projects/)
  await category.getByRole('button', { name: /^All projects/ }).click()
  await filterStatus(page, 'All statuses')
  await page.waitForFunction(() => document.querySelectorAll('#projects-grid article').length === 5)
  assert.equal(await page.locator('#coursework-grid article').count(), 3, 'Project filters changed coursework')
  activeResult.checks.filters = { systemsOngoingProjects: 1, academicDataUnknown: 1, academicDataCompleted: 0, systemsUnknownProjects: 0, emptyAnnouncements: true, independentBothDirections: true, restoredProjects: 5, restoredCoursework: 3 }
  await cleanLayout(page)
  await shot(page, name)
  if (!reducedMotion) {
    await page.getByRole('switch', { name: 'Visual animations', exact: true }).click()
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'off')
    await page.reload()
    await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor()
    // Hydration initially matches server markup. Wait for React's deferred
    // preference restoration rather than sampling that intentional first frame.
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'off' && document.querySelector('[role="switch"]')?.getAttribute('aria-checked') === 'false')
    assert.equal(await page.getByRole('switch', { name: 'Visual animations', exact: true }).getAttribute('aria-checked'), 'false', 'Motion preference was not persisted')
    await page.evaluate(() => { window.__sections.scrollCalls = [] })
    await navigateSection(page, 'contact')
    assert.equal(await page.evaluate(() => window.__sections.scrollCalls.some((call) => call.behavior === 'smooth')), false, 'Persisted motion-off anchor scrolled smoothly')
    activeResult.checks.motionOff = { persistedAfterReload: true, noSmoothAnchorScroll: true }
  }
}
async function run(name, options, check) {
  if (only.size && !only.has(name)) return
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', ...options })
  // Keep the runner local even if page markup includes remote fonts or embeds.
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    return ['http:', 'https:'].includes(url.protocol) && url.origin !== new URL(baseURL).origin ? route.abort() : route.continue()
  })
  await context.addInitScript(instrument)
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const result = { name, errors: [], console: [], passed: false, layouts: [], sections: [], checks: {} }
  activeResult = result
  page.on('pageerror', (error) => result.errors.push({ url: page.url(), message: error.message }))
  page.on('console', (message) => { if (message.type() === 'error') result.console.push({ url: page.url(), message: message.text() }) })
  try {
    await check(page)
    assert.deepEqual(result.errors, [], 'Uncaught page errors')
    assert.deepEqual(result.console.filter((entry) => /hydration|did not match|server html|Minified React error|hydrating/i.test(entry.message)), [], 'Hydration errors')
    result.passed = true
  } catch (error) {
    result.failure = error.stack
    await shot(page, `${name}-failure`).catch(() => {})
    process.exitCode = 1
  } finally {
    report.tests.push(result)
    await context.close()
    await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${name}${result.failure ? ': ' + result.failure : ''}`)
  }
}
try {
  const { chromium, modulePath } = await findPlaywright()
  const executablePath = await findChromium(chromium)
  browser = await chromium.launch({ headless: !argv.includes('--headed'), executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  Object.assign(report, { modulePath, executablePath, browserVersion: browser.version() })
  for (const [name, width, reduced] of [['desktop', 1440, false], ['mobile', 390, false], ['narrow', 320, false], ['reduced-motion', 1440, true]])
    await run(name, { viewport: { width, height: width < 500 ? 844 : 1000 }, reducedMotion: reduced ? 'reduce' : 'no-preference' }, (page) => checkHome(page, name, reduced))
  await run('no-js', { javaScriptEnabled: false }, async (page) => {
    await page.goto(baseURL + '/')
    assert.equal(await page.locator('main article').count(), 8)
    await page.locator('.menu-fallback summary').click()
    for (const id of sections) {
      const link = page.locator(`.static-section-nav a[href="/#${id}"]`).first()
      assert.ok(await link.count(), `${id} needs a no-JS visible anchor`)
      await link.click()
      await settledSection(page, id, false)
    }
    await cleanLayout(page)
    activeResult.checks.nativeNavigation = { anchors: [...sections], prerenderedArticles: 8 }
    await shot(page, 'no-js')
  })
  await run('routes', {}, async (page) => {
    for (const [route, count] of [['projects', 5], ['coursework', 3], ['about', 0], ['contact', 0]]) {
      await page.goto(`${baseURL}/${route}/`)
      await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor()
      assert.equal(await page.locator('main h1').count(), 1)
      assert.equal(await page.locator('main article').count(), count)
      await cleanLayout(page)
      const drawer = await menu(page)
      for (const id of sections) assert.equal(await drawer.locator(`#primary-navigation a[href="/#${id}"]`).count(), 1)
      await drawer.locator('#primary-navigation a[href="/#projects"]').click()
      await settledSection(page, 'projects')
      await page.goBack()
      await page.waitForURL(`**/${route}/`)
      await page.locator('main h1').waitFor()
      activeResult.checks.legacyRoutes ??= []
      activeResult.checks.legacyRoutes.push({ route, articles: count, returnToProjectsFocusedAndVisible: true, backToStandalone: true })
      await shot(page, `legacy-${route}`)
    }
    // Exercise genuine SPA legacy route trips with an actual local anchor.
    await page.goto(baseURL + '/')
    await page.evaluate(() => { window.__sections.phases = []; const link = document.createElement('a'); link.href = '/about/'; link.id = 'acceptance-legacy-link'; link.textContent = 'Legacy About'; document.querySelector('.site-shell').append(link) })
    await page.locator('#acceptance-legacy-link').click()
    await page.waitForURL('**/about/')
    await page.waitForFunction(() => document.querySelector('main h1') && !document.querySelector('#hero'))
    assert.ok(await page.evaluate(() => window.__sections.phases.some((phase) => phase && phase !== 'idle')), 'Cross-page legacy trip bypassed transit')
    activeResult.checks.crossPageTransit = await page.evaluate(() => window.__sections.phases.filter(Boolean))
  })
} catch (error) {
  report.failure = error.stack
  process.exitCode = 1
} finally {
  await browser?.close()
  report.finishedAt = new Date().toISOString()
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(`Report: ${join(output, 'report.json')}`)
}
