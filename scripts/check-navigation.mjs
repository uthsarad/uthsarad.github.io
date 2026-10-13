#!/usr/bin/env node
/** Combined logo/menu acceptance. Run against a built preview, with an existing
 * Playwright installation and Chromium. Never installs packages or launches a server.
 * node scripts/check-navigation.mjs --url http://127.0.0.1:4173 --output <directory>
 * PLAYWRIGHT_MODULE and PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH override cached tools.
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
const url = option('--url', 'http://127.0.0.1:4173')
const output = resolve(option('--output', join(tmpdir(), 'portfolio-navigation')))
const exists = (path) => access(path).then(() => true, () => false)
const list = (path) => readdir(path).catch(() => [])
async function tools() {
  const candidates = [process.env.PLAYWRIGHT_MODULE].filter(Boolean)
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try { candidates.push(require.resolve(name)) } catch { /* Try caches below. */ }
  }
  for (const cache of [process.env.npm_config_cache, process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'npm-cache'), join(homedir(), '.npm')].filter(Boolean)) {
    for (const entry of await list(join(cache, '_npx')))
      for (const name of ['playwright', 'playwright-core'])
        candidates.push(join(cache, '_npx', entry, 'node_modules', name, 'index.mjs'))
  }
  for (let path of candidates) {
    if (await exists(join(path, 'index.mjs'))) path = join(path, 'index.mjs')
    if (!await exists(path)) continue
    const module = await import(pathToFileURL(resolve(path)).href)
    if (module.chromium) return module
  }
  throw new Error('No existing Playwright installation. Set PLAYWRIGHT_MODULE to index.mjs.')
}
const { chromium } = await tools()
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(),
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
await mkdir(output, { recursive: true })
const report = { url, startedAt: new Date().toISOString(), tests: [] }
const errors = []
async function test(name, options, check) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push({ name, message: error.message }))
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await check(page)
    report.tests.push({ name, outcome: 'PASS' })
    console.log('PASS', name)
  } catch (error) {
    report.tests.push({ name, outcome: 'FAIL', message: error.message })
    await page.screenshot({ path: join(output, name + '-failure.png') }).catch(() => {})
    console.error('FAIL', name, error.message)
  } finally {
    await context.close()
  }
}
const button = (page) => page.getByRole('button', { name: 'Open navigation', exact: true })
const drawer = (page) => page.locator('#navigation-drawer')
const open = (page) => page.waitForFunction(() => document.querySelector('#navigation-drawer').matches(':modal'))
const closed = (page) => page.waitForFunction(() => !document.querySelector('#navigation-drawer').open)
const away = (page) => page.mouse.move(page.viewportSize().width - 10, 400)
async function combined(page) {
  await button(page).waitFor()
  assert.equal(await page.locator('.side-navigation button[aria-controls]').count(), 1)
  assert.equal(await page.locator('.side-brand, .side-menu-toggle').count(), 0)
  assert.equal(await button(page).locator('.monogram').count(), 1)
  const rect = await button(page).boundingBox()
  assert.ok(rect.width >= 44 && rect.height >= 44)
  assert.ok(rect.x >= 0 && rect.x + rect.width <= page.viewportSize().width)
  assert.equal(await button(page).getAttribute('aria-expanded'), 'false')
}
try {
  await test('desktop-hover', { reducedMotion: 'reduce' }, async (page) => {
    await combined(page)
    await page.screenshot({ path: join(output, 'desktop-closed.png') })
    // A quick pass across the logo must not open the modal.
    await button(page).hover()
    await away(page)
    await page.waitForTimeout(300)
    assert.equal(await drawer(page).evaluate((node) => node.open), false)
    await button(page).hover()
    await open(page)
    await page.screenshot({ path: join(output, 'desktop-open.png') })
    await page.mouse.move(200, 300)
    assert.equal(await drawer(page).evaluate((node) => node.open), true)
    await away(page)
    await closed(page)
    assert.equal(await button(page).getAttribute('aria-expanded'), 'false')
  })
  await test('desktop-click', { reducedMotion: 'reduce' }, async (page) => {
    await combined(page)
    await button(page).click()
    await open(page)
    await away(page)
    assert.equal(await drawer(page).evaluate((node) => node.open), true)
    await page.getByRole('button', { name: 'Close navigation', exact: true }).click()
    await closed(page)
    assert.equal(await button(page).evaluate((node) => node === document.activeElement), true)
    await button(page).click()
    await open(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    await closed(page)
    await away(page)
    await button(page).hover()
    await open(page)
    await page.getByRole('button', { name: 'Close navigation', exact: true }).click()
    await closed(page)
    await button(page).click()
    await open(page)
    await page.mouse.click(page.viewportSize().width - 10, 400)
    await closed(page)
  })
  await test('keyboard', { reducedMotion: 'reduce' }, async (page) => {
    await combined(page)
    await button(page).focus()
    await page.keyboard.press('Enter')
    await open(page)
    assert.equal(await drawer(page).evaluate((node) => node.contains(document.activeElement)), true)
    await page.keyboard.press('Escape')
    await closed(page)
    assert.equal(await button(page).evaluate((node) => node === document.activeElement), true)
    await page.keyboard.press('Space')
    await open(page)
    // Keyboard use adopts a hover-opened menu rather than closing it on mouse exit.
    await page.keyboard.press('Escape')
    await closed(page)
    await button(page).hover()
    await open(page)
    await page.keyboard.press('Tab')
    await away(page)
    assert.equal(await drawer(page).evaluate((node) => node.open), true)
    await page.keyboard.press('Escape')
    await closed(page)
    // Escape returns to the opener even when hover interrupted another focused link.
    await page.locator('main a').first().focus()
    await button(page).hover()
    await open(page)
    await page.keyboard.press('Escape')
    await closed(page)
    assert.equal(await button(page).evaluate((node) => node === document.activeElement), true)
  })
  for (const width of [390, 320]) {
    await test('touch-' + width, { viewport: { width, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' }, async (page) => {
      await combined(page)
      await page.screenshot({ path: join(output, 'mobile-' + width + '.png') })
      await button(page).tap()
      await open(page)
      await drawer(page).locator('#primary-navigation a[href="/#projects"]').tap()
      await closed(page)
      await page.waitForFunction(() => location.hash === '#projects' && document.activeElement?.id === 'projects')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
    })
  }
  for (const height of [844, 320]) await test('no-js-' + height, { javaScriptEnabled: false, viewport: { width: 320, height } }, async (page) => {
    const summary = page.locator('.menu-fallback summary')
    await summary.click()
    assert.equal(await page.locator('.static-section-nav a').count(), 6)
    assert.equal(await summary.locator('.monogram').count(), 1)
    const panel = await page.locator('.static-section-nav').boundingBox()
    assert.ok(panel.y >= 0 && panel.y + panel.height <= height)
    await page.locator('.static-section-nav a[href="/#contact"]').click()
    assert.equal(new URL(page.url()).hash, '#contact')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
  })
  await test('voyage-and-pause', {}, async (page) => {
    await combined(page)
    await page.waitForFunction(() => document.querySelector('.black-hole').dataset.ready === 'true', null, { timeout: 45000 })
    await page.waitForFunction(() => document.querySelector('.black-hole').style.getPropertyValue('--drift-rot') !== '')
    const before = await page.locator('.black-hole').getAttribute('style')
    await page.mouse.wheel(0, 1800)
    await page.waitForFunction((before) => document.querySelector('.black-hole').getAttribute('style') !== before, before)
    const canvas = await page.locator('.black-hole canvas').evaluate((node) => {
      window.__navigationCanvas = node
      return { width: node.width, height: node.height }
    })
    assert.ok(canvas.width > 2 && canvas.height > 2)
    await button(page).click()
    await open(page)
    await page.keyboard.press('Escape')
    await closed(page)
    assert.equal(await page.locator('.black-hole canvas').evaluate((node) => node === window.__navigationCanvas), true)
    await page.getByRole('switch', { name: 'Visual animations' }).click()
    await page.waitForFunction(() => document.querySelector('.black-hole').dataset.motion === 'false')
    assert.equal(await page.locator('.black-hole').evaluate((node) => node.style.getPropertyValue('--drift-rot')), '')
    const requested = []
    page.on('request', (request) => requested.push(request.url()))
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await page.locator('.black-hole').getAttribute('data-motion'), 'false')
    assert.ok(!requested.some((url) => /\/(voyage|webgl|model)-[^/]+\.js/.test(url)))
    await page.getByRole('switch', { name: 'Visual animations' }).click()
    await page.waitForFunction(() => document.querySelector('.black-hole').dataset.ready === 'true', null, { timeout: 45000 })
    await page.waitForFunction(() => document.querySelector('.black-hole').style.getPropertyValue('--drift-rot') !== '')
  })
  await test('reduced-motion-no-voyage', { reducedMotion: 'reduce' }, async (page) => {
    await combined(page)
    assert.equal(await page.locator('.black-hole').getAttribute('data-ready'), 'false')
    assert.equal(await page.locator('.black-hole').getAttribute('data-motion'), 'false')
    const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name))
    assert.ok(!resources.some((url) => /\/(voyage|webgl|model)-[^/]+\.js/.test(url)))
    await button(page).click()
    await open(page)
    await page.keyboard.press('Escape')
    await closed(page)
  })
} finally {
  report.finishedAt = new Date().toISOString()
  report.pageErrors = errors
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
assert.deepEqual(errors, [], 'Runtime errors')
assert.ok(report.tests.every((test) => test.outcome === 'PASS'), 'Navigation acceptance failed')
console.log(`${report.tests.length} navigation scenarios passed. Report: ${join(output, 'report.json')}`)
