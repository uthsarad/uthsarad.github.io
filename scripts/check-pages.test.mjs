import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { loadContentContract, assertLifecycleBadges, assertResumeFilename } from './content-contract.mjs'

const content = await loadContentContract()
const root = new URL('../', import.meta.url)
const pages = JSON.parse(
  await readFile(new URL('src/data/pages.json', root), 'utf8'),
)
const origin = 'https://uthsarad.github.io'

test('Every public page has a deployable document, unique metadata, and valid bundled assets', async () => {
  const titles = new Set()
  const canonicals = new Set()
  for (const page of Object.values(pages)) {
    const html = await readFile(
      new URL('dist' + page.href + 'index.html', root),
      'utf8',
    )
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
    const canonical = html.match(
      /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/,
    )?.[1]
    assert.ok(
      title?.includes('Uthsara Dahanaike'),
      page.href + ' needs a page title',
    )
    assert.equal(canonical, origin + page.href)
    assert.ok(!titles.has(title), 'Page titles must be distinct')
    assert.ok(!canonicals.has(canonical), 'Canonical URLs must be distinct')
    titles.add(title)
    canonicals.add(canonical)
    const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => tag)
    const socialUrl = meta.find((tag) => tag.includes('property="og:url"'))
    assert.ok(
      socialUrl?.includes('content="' + canonical + '"'),
      'Social URL must identify this page',
    )
    const description = meta.find((tag) => tag.includes('name="description"'))
    assert.ok(
      description?.includes(page.description),
      'Description must identify this page',
    )
    assert.ok(
      !html.includes('/src/main.tsx'),
      'Production pages must use built assets',
    )
    const assets = [
      ...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g),
    ].map((match) => match[1])
    assert.ok(
      assets.some((path) => path.endsWith('.js')),
      'Missing JavaScript entry',
    )
    assert.ok(
      assets.some((path) => path.endsWith('.css')),
      'Missing stylesheet',
    )
    for (const asset of assets) await access(new URL('dist' + asset, root))
  }
})

test('Sitemap includes all five pages and the static 404 remains available', async () => {
  const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8')
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  )
  assert.deepEqual(
    locations.sort(),
    Object.values(pages)
      .map((page) => origin + page.href)
      .sort(),
  )
  const notFound = await readFile(new URL('dist/404.html', root), 'utf8')
  assert.ok(notFound.includes('href="/"'))
  assert.ok(notFound.includes('noindex'))
})

test('Every route ships complete readable HTML before JavaScript executes', async () => {
  const expected = {
    '/': { text: 'Computer Science student in Colombo', articles: 8 },
    '/projects/': { text: 'FerrumCalc', articles: 5 },
    '/coursework/': { text: 'Osteoporosis Detection', articles: 3 },
    '/about/': { text: 'Edith Cowan University', articles: 0 },
    '/contact/': { text: 'mailto:uthsarad@gmail.com', articles: 0 },
  }
  for (const [href, content] of Object.entries(expected)) {
    const html = await readFile(
      new URL('dist' + href + 'index.html', root),
      'utf8',
    )
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]
    assert.ok(
      main?.includes(content.text),
      href + ' must contain its actual page content',
    )
    assert.equal(
      (main.match(/<h1\b/g) ?? []).length,
      1,
      'Each route needs one rendered main heading',
    )
    assert.equal((main.match(/<article\b/g) ?? []).length, content.articles)
    assert.ok(
      !html.includes('<!--$!-->'),
      'Static render must not contain aborted Suspense boundaries',
    )
    assert.ok(
      !html.includes('data-revealed='),
      'HTML must stay visible without waiting for an entrance animation',
    )
    assert.ok(gzipSync(html).length < 12000, href + ' HTML exceeded 12 kB gzip')
  }
})

test('Home section anchors, lifecycle badges, and optional resume are readable without JavaScript', async () => {
  const html = await readFile(new URL('dist/index.html', root), 'utf8')
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
  const sections = ['hero', 'interests', 'projects', 'coursework', 'about', 'contact']
  let previous = -1
  for (const id of sections) {
    const position = main.search(new RegExp(`<section\\b[^>]*id="${id}"`))
    assert.ok(position > previous, `${id} must be an ordered home section`)
    previous = position
    assert.ok(html.includes(`href="/#${id}"`), `${id} needs a native navigation anchor`)
  }
  for (const id of ['projects-title', 'coursework-title', 'projects-grid', 'coursework-grid'])
    assert.equal([...html.matchAll(new RegExp(`\\bid="${id}"`, 'g'))].length, 1, `${id} must be unique`)
  for (const id of ['projects-title', 'coursework-title'])
    assert.match(main, new RegExp(`<h2\\b[^>]*id="${id}"`))
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
  assert.equal(new Set(ids).size, ids.length, 'Home IDs must be unique')
  assertLifecycleBadges(main, [...content.projects, ...content.coursework])
  const hasResume = content.resume.available
  for (const page of Object.values(pages)) {
    const document = await readFile(new URL('dist' + page.href + 'index.html', root), 'utf8')
    for (const id of sections) assert.ok(document.includes(`href="/#${id}"`), `${page.href} menu needs ${id}`)
    const expectedControls = page.href === '/' ? 3 : page.href === '/contact/' ? 2 : 1
    if (hasResume) {
      const links = [...document.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
        .filter((match) => match[1].includes(`href="${content.resume.href}"`) && /Download resume/.test(match[2]))
      assert.equal(links.length, expectedControls, `${page.href} needs every configured native resume link`)
      for (const link of links) assertResumeFilename(link[1], content.resume.filename)
    } else {
      assert.ok(!document.includes('href="/resume.pdf"'), 'No broken resume link')
      const buttons = [...document.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter((match) => /Download resume/.test(match[2]))
      assert.equal(buttons.length, expectedControls, `${page.href} needs every explained unavailable control`)
      for (const button of buttons) {
        assert.ok(/\bdisabled(?:="")?/.test(button[1]), 'Absent resume must have a disabled download button')
        const explanation = button[1].match(/aria-describedby="([^"]+)"/)?.[1]
        assert.ok(explanation && document.includes(`id="${explanation}"`), 'Disabled resume needs an accessible explanation')
      }
    }
  }
})

test('Direct visits preload reachable static page dependencies only, with bounded JavaScript cost', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('dist/.vite/manifest.json', root), 'utf8'),
  )
  const routes = {
    '/': 'Home',
    '/projects/': 'Showcase',
    '/coursework/': 'Showcase',
    '/about/': 'About',
    '/contact/': 'Contact',
  }
  const entry = await readFile(
    new URL('dist/' + manifest['index.html'].file, root),
  )
  assert.ok(
    gzipSync(entry).length < 56000,
    'Shared runtime exceeded 56 kB gzip',
  )
  for (const [href, section] of Object.entries(routes)) {
    const html = await readFile(
      new URL('dist' + href + 'index.html', root),
      'utf8',
    )
    const assets = new Set(
      [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.js)"/g)].map(
        (match) => match[1],
      ),
    )
    const pageKey = `src/sections/${section}.tsx`
    const reachable = new Set()
    const visit = (key) => {
      if (reachable.has(key)) return
      reachable.add(key)
      for (const dependency of manifest[key]?.imports ?? []) visit(dependency)
    }
    visit(pageKey)
    visit('index.html')
    const pageFile = manifest[pageKey].file
    assert.ok(
      assets.has('/' + pageFile),
      href + ' needs its page module preloaded',
    )
    for (const [key, chunk] of Object.entries(manifest)) {
      if (key.startsWith('src/sections/') && !reachable.has(key))
        assert.ok(
          !assets.has('/' + chunk.file),
          href + ' preloads unrelated page ' + key,
        )
      if (key.includes('BlackHole') || key.includes('Aurora') || key.includes('Antigravity'))
        assert.ok(
          !assets.has('/' + chunk.file),
          'Decorative renderers must stay outside the critical preload path',
        )
    }
    let gzipBytes = 0
    for (const asset of assets)
      gzipBytes += gzipSync(
        await readFile(new URL('dist' + asset, root)),
      ).length
    // Home embeds all collections, filters, About and Contact (measured 66,742 B gzip).
    // Standalone legacy documents retain the original 62 kB ceiling.
    const budget = href === '/' ? 70000 : 62000
    assert.ok(
      gzipBytes < budget,
      href + ` initial page JavaScript exceeded ${budget / 1000} kB gzip (${gzipBytes} bytes)`,
    )
  }
})
