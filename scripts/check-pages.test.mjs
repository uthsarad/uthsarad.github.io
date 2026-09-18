import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

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
