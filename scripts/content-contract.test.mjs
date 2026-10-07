import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseCollections, parseResumeDescriptor, matchingItems, assertLifecycleBadges, assertResumeFilename, assertResumeIntegrity, lifecycleLabels } from './content-contract.mjs'

// In-memory fixtures verify harness readiness only. They never change real owner
// lifecycle facts, create an actual resume, or substitute for public-UI acceptance.
const fixture = (status = 'unknown') => `
export const projects = [
  { id: 'private-example', title: 'Private example', status: 'Private', lifecycle: '${status}', tags: ['tools'] },
  { id: 'usable-example', title: 'Usable example', status: 'Usable', lifecycle: 'ongoing', tags: ['systems'] },
]
export const coursework = [{ id: 'academic-example', title: 'Academic example', status: 'CSG0000', lifecycle: 'completed', tags: ['ai'] }]
`
const cards = (items) => items.map((item) => `<article><h3 id="title-${item.id}">${item.title}</h3><span class="project-status project-lifecycle is-${item.lifecycle}">${lifecycleLabels[item.lifecycle]}</span></article>`).join('')

test('Current literal source loads without converting repository context into lifecycle facts', async () => {
  const text = await readFile(new URL('../src/data/projects.ts', import.meta.url), 'utf8')
  const collections = parseCollections(text)
  assert.ok(collections.projects.length && collections.coursework.length)
  assert.equal(new Set([...collections.projects, ...collections.coursework].map((item) => item.id)).size, collections.projects.length + collections.coursework.length)
})
test('Different declared lifecycle values are accepted without hardcoding an unknown badge', () => {
  for (const value of ['unknown', 'ongoing', 'completed']) {
    const content = parseCollections(fixture(value))
    assert.equal(content.projects[0].lifecycle, value)
    assert.equal(content.projects[0].status, 'Private')
    assert.equal(content.projects[1].status, 'Usable')
    assertLifecycleBadges(cards([...content.projects, ...content.coursework]), [...content.projects, ...content.coursework])
  }
})
test('Source parsing rejects computed data without executing it', () => {
  globalThis.__contentContractExecuted = false
  const text = fixture().replace("lifecycle: 'unknown'", "lifecycle: (() => { globalThis.__contentContractExecuted = true; return 'completed' })()")
  assert.throws(() => parseCollections(text), /literal data/)
  assert.equal(globalThis.__contentContractExecuted, false)
  delete globalThis.__contentContractExecuted
})
test('Invalid states, duplicate IDs and object spreads fail explicitly', () => {
  assert.throws(() => parseCollections(fixture('Private')), /invalid lifecycle/)
  assert.throws(() => parseCollections(fixture().replace("id: 'usable-example'", "id: 'private-example'")), /Duplicate collection ID/)
  assert.throws(() => parseCollections(fixture().replace("title: 'Private example'", "...other, title: 'Private example'")), /literal property assignments/)
  assert.throws(() => parseCollections(fixture().replace("title: 'Private example'", "title: 'Private example', title: 'Duplicate'")), /duplicate properties/)
})
test('Filter expectations compose lifecycle and tag membership, including zero matches', () => {
  const { projects, coursework } = parseCollections(fixture('completed'))
  assert.deepEqual(matchingItems(projects, 'completed', 'tools').map((item) => item.id), ['private-example'])
  assert.deepEqual(matchingItems(projects, 'ongoing', 'tools'), [])
  assert.deepEqual(matchingItems(coursework, 'completed', 'ai').map((item) => item.id), ['academic-example'])
  assert.equal(matchingItems(projects).length, 2)
  assert.throws(() => matchingItems(projects, 'Private'), /Invalid lifecycle filter/)
})
test('Stale, duplicate or mislabeled prerendered lifecycle badges are rejected', () => {
  const content = parseCollections(fixture('completed'))
  const html = cards(content.projects)
  assert.throws(() => assertLifecycleBadges(html.replace('is-completed', 'is-unknown'), content.projects), /declared lifecycle/)
  assert.throws(() => assertLifecycleBadges(html.replace('>Completed<', '>Ongoing<'), content.projects), /literal lifecycle label/)
  assert.throws(() => assertLifecycleBadges(html + html, content.projects), /one prerendered card/)
  assert.throws(() => assertLifecycleBadges(html.replace('is-completed', 'is-completed is-unknown'), content.projects), /declared lifecycle/)
})
test('Configured resume descriptor is read without evaluating availability or copying a document', () => {
  const text = "export const profile = { resume: __RESUME_AVAILABLE__ ? { href: '/resume.pdf', filename: 'Owner-Resume.pdf' } : null }"
  assert.deepEqual(parseResumeDescriptor(text), { href: '/resume.pdf', filename: 'Owner-Resume.pdf' })
  assert.throws(() => parseResumeDescriptor(text.replace('Owner-Resume.pdf', '../private.pdf')), /plain PDF download filename/)
  assert.throws(() => parseResumeDescriptor(text.replace("'/resume.pdf'", "'/other.pdf'")), /dedicated public PDF/)
})
test('Configured download filename survives actual React attribute serialization', () => {
  for (const filename of ['Owner-Resume.pdf', 'Owner & Resume.pdf', 'Owner\'s "Resume" <approved>.pdf']) {
    const descriptor = parseResumeDescriptor(`export const profile = { resume: __RESUME_AVAILABLE__ ? { href: '/resume.pdf', filename: ${JSON.stringify(filename)} } : null }`)
    const html = renderToStaticMarkup(createElement('a', { href: descriptor.href, download: descriptor.filename }, 'Download resume'))
    const attributes = html.match(/<a\b([^>]*)>/)?.[1] ?? ''
    assertResumeFilename(attributes, descriptor.filename)
    assert.throws(() => assertResumeFilename(attributes, 'Older-Resume.pdf'), /configured native filename/)
    assert.throws(() => assertResumeFilename(attributes.replace(' download=', ' data-download='), descriptor.filename), /configured native filename/)
    assert.throws(() => assertResumeFilename(' href="/resume.pdf"', descriptor.filename), /configured native filename/)
  }
})
test('Resume signature and exact source-to-built bytes are checked, not just asset existence', () => {
  const synthetic = Buffer.from('%PDF-1.7\nSynthetic integrity-policy fixture only\n')
  assert.equal(assertResumeIntegrity(synthetic, Buffer.from(synthetic)).available, true)
  assert.equal(assertResumeIntegrity(synthetic, Buffer.from(synthetic)).bytes, synthetic.length)
  assert.deepEqual(assertResumeIntegrity(null, null), { available: false })
  assert.throws(() => assertResumeIntegrity(Buffer.from('<html>fallback</html>'), Buffer.from('<html>fallback</html>')), /PDF signature/)
  assert.throws(() => assertResumeIntegrity(synthetic, Buffer.from('%PDF-1.7\nOlder fixture\n')), /current public PDF/)
  assert.throws(() => assertResumeIntegrity(synthetic, null), /copied into dist/)
  assert.throws(() => assertResumeIntegrity(null, synthetic), /must not remain publicly downloadable/)
})
