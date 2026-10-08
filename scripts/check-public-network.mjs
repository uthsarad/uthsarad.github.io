#!/usr/bin/env node
/** Phase-labelled public network observations against an existing local build.
 * Start the real production preview separately, then run:
 * node scripts/check-public-network.mjs --url http://127.0.0.1:4173
 * Optional --output directory. Uses installed Playwright and Chromium only.
 * No request interception, fixture content, application-state patches or installs.
 * Request starts and failures retain separate phases, including context teardown.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { settleTrackedRequests } from './request-settlement.mjs'

const require = createRequire(import.meta.url)
const argv = process.argv.slice(2)
const option = (name, fallback) => {
  const index = argv.indexOf(name)
  return index === -1 ? fallback : argv[index + 1]
}
const baseURL = option('--url', 'http://127.0.0.1:4173')
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const defaultOutput = join(tmpdir(), 'portfolio-network-phases')
const requestedOutput = option('--output', defaultOutput)
const output = resolve(requestedOutput || defaultOutput)
const exists = async (path) => access(path).then(() => true, () => false)
const list = async (path) => readdir(path).catch(() => [])

// Use the same existing-package/cache discovery policy as check-sections.mjs.
async function findPlaywright() {
  const candidates = []
  if (process.env.PLAYWRIGHT_MODULE) candidates.push(process.env.PLAYWRIGHT_MODULE)
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try { candidates.push(require.resolve(name)) } catch { /* Try known caches next. */ }
  }
  const caches = [process.env.npm_config_cache,
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'npm-cache'),
    join(homedir(), '.npm')].filter(Boolean)
  for (const cache of caches) {
    for (const entry of await list(join(cache, '_npx'))) {
      for (const name of ['playwright', 'playwright-core']) {
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
  throw new Error('No existing Playwright found. Set PLAYWRIGHT_MODULE to its index.mjs.')
}

const report = {
  startedAt: new Date().toISOString(), baseURL,
  scope: 'Actual built repository public UI with normal requests. New phase attribution does not retrospectively prove the phase of older untimed failures.',
  requestInterception: false, applicationStatePatched: false,
  outcome: 'RUNNING', scenarios: [], phases: [], builtDocuments: [], failedRequests: [], httpErrors: [], pageErrors: [],
}
try { report.observedGitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repositoryRoot, encoding: 'utf8' }).trim() }
catch { report.observedGitHead = null }
const reportPath = join(output, 'network-phases.json')
let browser

async function scenario(name, options, actions) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  let phase = `${name}.created`
  const pending = new Map()
  let lastActivityAt = Date.now()
  const result = { name, javaScriptEnabled: options.javaScriptEnabled !== false, requestCount: 0,
    finishedRequests: 0, responseCount: 0, observations: [], pendingAtClose: [] }
  report.scenarios.push(result)
  const mark = (action) => {
    phase = `${name}.${action}`
    report.phases.push({ phase, at: new Date().toISOString() })
    console.log(phase)
  }
  page.on('request', (request) => {
    lastActivityAt = Date.now()
    result.requestCount++
    pending.set(request, { requestId: result.requestCount, context: name, url: request.url(), resourceType: request.resourceType(),
      startedPhase: phase, startedAt: new Date().toISOString() })
  })
  page.on('requestfinished', (request) => { lastActivityAt = Date.now(); result.finishedRequests++; pending.delete(request) })
  page.on('requestfailed', (request) => {
    lastActivityAt = Date.now()
    report.failedRequests.push({ ...pending.get(request), context: name, url: request.url(),
      resourceType: request.resourceType(), failedPhase: phase, failedAt: new Date().toISOString(),
      errorText: request.failure()?.errorText })
    pending.delete(request)
  })
  page.on('response', (response) => {
    result.responseCount++
    if (response.status() >= 400) report.httpErrors.push({ context: name, phase, url: response.url(), status: response.status() })
  })
  page.on('pageerror', (error) => report.pageErrors.push({ context: name, phase, message: error.message }))
  const note = (name, evidence) => result.observations.push({ name, evidence, phase, at: new Date().toISOString() })
  try {
    await actions({ page, mark, note })
    if (name !== 'reduced-motion-early-close') {
      mark('settle-tracked-requests')
      result.requestSettlement = await settleTrackedRequests(pending, () => lastActivityAt)
      note('observed request ledger settled', result.requestSettlement)
    }
    result.settledBeforeClose = pending.size === 0
    if (name !== 'reduced-motion-early-close') assert.equal(pending.size, 0, 'Settled public workflow must finish all requests before context close')
    result.outcome = name === 'reduced-motion-early-close' ? 'BOUNDARY_OBSERVED' : 'PASS'
  } catch (error) {
    result.outcome = 'FAIL'
    result.error = error.stack
    throw error
  } finally {
    mark('teardown')
    result.pendingAtClose = [...pending.values()]
    try {
      await context.close()
    } catch (error) {
      result.outcome = 'FAIL'
      result.cleanupError = error.stack
      throw error
    } finally {
      result.pendingAfterClose = [...pending.values()]
      await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
    }
  }
}

async function openBuiltPage(page, pathname = '/') {
  const response = await page.goto(new URL(pathname, baseURL).href)
  assert.equal(response?.status(), 200, 'Built document must load successfully')
  const bytes = await response.body()
  const expected = await readFile(join(repositoryRoot, 'dist', ...pathname.split('/').filter(Boolean), 'index.html'))
  assert.deepEqual(bytes, expected, 'Browser response must match this repository production document, not another server on the same port')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  report.builtDocuments.push({ path: pathname, url: response.url(), sha256, bytes: bytes.length })
  return response
}

async function ready(page, rendererEnabled = true) {
  await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor()
  if (rendererEnabled) await page.waitForFunction(() => document.querySelector('.black-hole')?.dataset.ready === 'true', null, { timeout: 60000 })
  else await page.waitForFunction(() => document.documentElement.dataset.motion === 'off')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle', { timeout: 30000 })
}
async function navigate(page, id) {
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.locator(`#primary-navigation a[href="/#${id}"]`).click()
  await page.waitForFunction((id) => {
    const node = document.getElementById(id)
    const rect = node?.getBoundingClientRect()
    return location.pathname === '/' && location.hash === `#${id}` && node === document.activeElement && rect?.top < innerHeight && rect.bottom > 0
  }, id)
}

try {
  await mkdir(output, { recursive: true })
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
  assert.ok(typeof baseURL === 'string' && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname), 'Use a local production preview')
  assert.ok(typeof requestedOutput === 'string' && requestedOutput.trim(), '--output requires a directory')
  report.driverSha256 = createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex')
  const { chromium, modulePath } = await findPlaywright()
  const candidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, chromium.executablePath(),
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe')].filter(Boolean)
  const executablePath = (await Promise.all(candidates.map(exists))).map((present, index) => present ? candidates[index] : null).find(Boolean)
  assert.ok(executablePath, 'Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to an installed Chromium executable')
  report.playwrightModule = modulePath
  report.executablePath = executablePath
  browser = await chromium.launch({ headless: true, executablePath, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  report.browser = browser.version()
  await scenario('desktop', {}, async ({ page, mark, note }) => {
    mark('load')
    await openBuiltPage(page)
    await ready(page)
    const fonts = await page.evaluate(() => ({ canvasReady: document.querySelector('.black-hole')?.dataset.ready,
      fonts: [...document.fonts].filter((font) => font.status === 'loaded').map((font) => ({ family: font.family, status: font.status })) }))
    for (const family of ['Inter', 'JetBrains Mono']) assert.ok(fonts.fonts.some((font) => font.family === family), `Used font ${family} must load normally`)
    note('ready canvas and normal font faces', fonts)
    for (const id of ['hero', 'interests', 'projects', 'coursework', 'about', 'contact']) {
      mark('drawer-' + id)
      await navigate(page, id)
      note('native section link ' + id, { url: page.url() })
    }
    mark('full-document-projects')
    await openBuiltPage(page, '/projects/')
    await ready(page)
    mark('standalone-to-home-contact')
    await navigate(page, 'contact')
    await ready(page)
    note('native standalone-to-home link', { url: page.url() })
  })
  await scenario('paused-reloads', {}, async ({ page, mark, note }) => {
    mark('load')
    await openBuiltPage(page)
    await ready(page)
    mark('native-pause')
    await page.getByRole('switch', { name: 'Visual animations', exact: true }).click()
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'off' && document.querySelector('.black-hole')?.dataset.ready === 'false')
    await page.waitForLoadState('networkidle')
    const payloadStarts = []
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname
      if (/\/black-hole\/.*(?:\.dat|noise_texture\.png)$/.test(pathname)) payloadStarts.push({ url: request.url(), at: new Date().toISOString() })
    })
    for (const id of ['hero', 'about']) {
      mark('paused-drawer-' + id)
      await navigate(page, id)
      for (let index = 1; index <= 3; index++) {
        mark(`paused-reload-${id}-${index}`)
        const response = await page.reload()
        assert.equal(response?.status(), 200)
        assert.deepEqual(await response.body(), await readFile(join(repositoryRoot, 'dist', 'index.html')))
        await ready(page, false)
        const state = await page.evaluate(() => ({ motion: document.documentElement.dataset.motion,
          canvasReady: document.querySelector('.black-hole')?.dataset.ready,
          checked: document.querySelector('[role="switch"]')?.getAttribute('aria-checked'), hash: location.hash }))
        assert.equal(state.motion, 'off')
        assert.equal(state.canvasReady, 'false')
        assert.equal(state.checked, 'false')
        assert.equal(state.hash, '#' + id)
        note('native saved-pause reload', state)
      }
    }
    note('saved-pause payload starts', payloadStarts)
    assert.deepEqual(payloadStarts, [], 'Saved pause must prevent renderer startup, not merely hide or abort it')
  })
  for (const width of [390, 320]) {
    await scenario('mobile-' + width, { viewport: { width, height: 844 }, isMobile: true, hasTouch: true }, async ({ page, mark, note }) => {
      mark('load')
      await openBuiltPage(page)
      await ready(page)
      mark('drawer-projects')
      await navigate(page, 'projects')
      note('ready mobile public navigation', { url: page.url(), width })
      await page.waitForLoadState('networkidle')
    })
  }
  await scenario('reduced-motion-settled', { reducedMotion: 'reduce' }, async ({ page, mark, note }) => {
    mark('load')
    await openBuiltPage(page)
    // BlackHole deliberately never initializes WebGL under system reduced motion.
    await ready(page, false)
    mark('drawer-projects')
    await navigate(page, 'projects')
    await page.waitForLoadState('networkidle')
    const state = await page.evaluate(() => ({ url: location.href, motion: document.documentElement.dataset.motion,
      canvasReady: document.querySelector('.black-hole')?.dataset.ready }))
    assert.equal(state.motion, 'off')
    assert.equal(state.canvasReady, 'false')
    note('settled reduced-motion public workflow', state)
  })
  await scenario('reduced-motion-early-close', { reducedMotion: 'reduce' }, async ({ page, mark, note }) => {
    mark('load')
    await openBuiltPage(page)
    await page.getByRole('button', { name: 'Open navigation', exact: true }).waitFor()
    mark('drawer-projects')
    await navigate(page, 'projects')
    note('native reduced-motion navigation without waiting for network settlement', await page.evaluate(() => ({ url: location.href,
      motion: document.documentElement.dataset.motion, canvasReady: document.querySelector('.black-hole')?.dataset.ready ?? null })))
    // Intentionally retain the earlier observation's early context-close boundary.
    // Pending requests are observed, never cancelled or intercepted by the driver.
  })
  await scenario('no-js', { javaScriptEnabled: false }, async ({ page, mark, note }) => {
    mark('load')
    const response = await openBuiltPage(page)
    report.noJsModulePreloads = await page.locator('link[rel="modulepreload"]').evaluateAll((nodes) => nodes.map((node) => node.href))
    note('document headers', { status: response.status(), contentType: response.headers()['content-type'],
      contentSecurityPolicy: response.headers()['content-security-policy'] ?? null })
    const sections = await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.id))
    assert.deepEqual(sections, ['hero', 'interests', 'projects', 'coursework', 'about', 'contact'])
    assert.equal(await page.locator('main article').count(), 8)
    mark('native-details')
    const details = page.locator('main article details')
    assert.equal(await details.count(), 8, 'Every prerendered article must retain its native disclosure')
    for (let index = 0; index < await details.count(); index++) {
      const disclosure = details.nth(index)
      await disclosure.locator('summary').click()
      assert.notEqual(await disclosure.getAttribute('open'), null)
    }
    note('no-JS readable disclosures', { sections, articles: 8, openedDetails: await page.locator('main article details[open]').count() })
    mark('fallback-contact')
    await page.locator('.menu-fallback summary').click()
    await page.locator('.static-section-nav a[href="/#contact"]').first().click()
    assert.equal(new URL(page.url()).hash, '#contact')
    note('native no-JS Contact link', { url: page.url() })
    await page.waitForLoadState('networkidle')
  })
  report.failureGroups = {
    noJsModuleRequests: report.failedRequests.filter((event) => event.context === 'no-js' && event.startedPhase === 'no-js.load'
      && event.errorText === 'csp' && event.resourceType === 'script' && new URL(event.url).origin === new URL(baseURL).origin
      && new URL(event.url).pathname.startsWith('/assets/') && new URL(event.url).pathname.endsWith('.js')
      && report.noJsModulePreloads.includes(event.url)),
    teardownAborts: report.failedRequests.filter((event) => event.context === 'reduced-motion-early-close'
      && event.failedPhase === 'reduced-motion-early-close.teardown' && event.errorText === 'net::ERR_ABORTED'
      && event.requestId != null && report.scenarios.find((item) => item.name === event.context)?.pendingAtClose
        .some((pending) => pending.requestId === event.requestId && pending.url === event.url)),
  }
  report.unexpectedFailures = report.failedRequests.filter((event) => !report.failureGroups.noJsModuleRequests.includes(event) && !report.failureGroups.teardownAborts.includes(event))
  assert.deepEqual(report.unexpectedFailures, [], 'Unexpected normal-network request failures')
  assert.deepEqual(report.httpErrors, [], 'HTTP >=400 responses')
  assert.deepEqual(report.pageErrors, [], 'Uncaught page errors')
  report.outcome = 'PASS'
} catch (error) {
  report.outcome = 'FAIL'
  report.error = error.stack
  process.exitCode = 1
} finally {
  try {
    if (browser) await browser.close()
  } catch (error) {
    report.outcome = 'FAIL'
    report.cleanupError = error.stack
    process.exitCode = 1
  } finally {
    report.finishedAt = new Date().toISOString()
    await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')
  }
  console.log(`REPORT ${reportPath}`)
  console.log(JSON.stringify({ outcome: report.outcome, scenarios: report.scenarios.map(({ name, outcome }) => ({ name, outcome })),
    failedRequests: report.failedRequests, unexpectedFailures: report.unexpectedFailures, error: report.error }, null, 2))
}
