import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Each route gets a real HTML document for GitHub Pages, including on refresh.
// All documents share Vite's fingerprinted assets and the same React shell.
const root = new URL('../', import.meta.url)
const pages = JSON.parse(
  await readFile(new URL('src/data/pages.json', root), 'utf8'),
)
const template = await readFile(new URL('dist/index.html', root), 'utf8')
const origin = 'https://uthsarad.github.io'
const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

for (const page of Object.values(pages)) {
  const url = origin + page.href
  const metadata = {
    description: page.description,
    'og:title': page.title,
    'og:description': page.description,
    'og:url': url,
    'twitter:title': page.title,
    'twitter:description': page.description,
  }
  let html = template.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(page.title)}</title>`,
  )
  html = html.replace(/<meta\b[^>]*>/g, (tag) => {
    const key = tag.match(/(?:name|property)="([^"]+)"/)?.[1]
    return metadata[key]
      ? tag.replace(/content="[^"]*"/, `content="${escapeHtml(metadata[key])}"`)
      : tag
  })
  html = html.replace(
    /<link\b[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
  )
  const directory = new URL('dist' + page.href, root)
  await mkdir(directory, { recursive: true })
  await writeFile(new URL('index.html', directory), html)
  console.log('Page: ' + page.href)
}

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  Object.values(pages)
    .map((page) => `  <url><loc>${origin + page.href}</loc></url>`)
    .join('\n') +
  '\n</urlset>\n'
await writeFile(new URL('dist/sitemap.xml', root), sitemap)
console.log('Generated sitemap in ' + fileURLToPath(new URL('dist/', root)))
