import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

export const lifecycleLabels = { ongoing: 'Ongoing', completed: 'Completed', unknown: 'Status not confirmed' }
export const statusOptions = { all: 'All statuses', ...lifecycleLabels }
const root = new URL('../', import.meta.url)

// Read declarations, not rendered DOM or executed application code. The existing
// TypeScript compiler parses literals only. Spreads/calls/getters fail explicitly.
function sourceFile(text, filename) {
  const file = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  assert.equal(file.parseDiagnostics.length, 0, `${filename} contains invalid TypeScript syntax`)
  return file
}
function initializer(file, name) {
  const declarations = file.statements.filter(ts.isVariableStatement)
    .filter((statement) => statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
    .flatMap((statement) => [...statement.declarationList.declarations])
    .filter((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === name)
  assert.equal(declarations.length, 1, `Expected one exported ${name} declaration`)
  assert.ok(declarations[0].initializer, `${name} needs a literal initializer`)
  return declarations[0].initializer
}
function literal(node, label) {
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return literal(node.expression, label)
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element, index) => literal(element, `${label}[${index}]`))
  if (ts.isObjectLiteralExpression(node)) {
    const entries = node.properties.map((property) => {
      assert.ok(ts.isPropertyAssignment(property), `${label} must use literal property assignments`)
      assert.ok(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name), `${label} cannot use computed property names`)
      return [property.name.text, literal(property.initializer, `${label}.${property.name.text}`)]
    })
    assert.equal(new Set(entries.map(([name]) => name)).size, entries.length, `${label} has duplicate properties`)
    return Object.fromEntries(entries)
  }
  throw new Error(`${label} must be literal data, not ${ts.SyntaxKind[node.kind]}`)
}

export function parseCollections(text) {
  const file = sourceFile(text, 'projects.ts')
  const collections = Object.fromEntries(['projects', 'coursework'].map((name) => [name, literal(initializer(file, name), name)]))
  const ids = new Set()
  for (const [name, items] of Object.entries(collections)) {
    assert.ok(Array.isArray(items), `${name} must be an array`)
    for (const item of items) {
      assert.ok(item && typeof item === 'object' && !Array.isArray(item), `${name} entries must be records`)
      assert.match(item.id ?? '', /^[a-z][a-z0-9_-]*$/, `${name} needs a stable ID`)
      assert.ok(!ids.has(item.id), `Duplicate collection ID ${item.id}`)
      ids.add(item.id)
      assert.ok(typeof item.title === 'string' && item.title.trim(), `${item.id} needs a title`)
      assert.ok(Object.hasOwn(lifecycleLabels, item.lifecycle), `${item.id} has invalid lifecycle ${item.lifecycle}`)
      assert.ok(item.tags === undefined || (Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === 'string')), `${item.id} needs literal string tags`)
    }
  }
  return collections
}

export function parseResumeDescriptor(text) {
  const file = sourceFile(text, 'profile.ts')
  const profile = initializer(file, 'profile')
  assert.ok(ts.isObjectLiteralExpression(profile), 'profile must be an object literal')
  const properties = profile.properties.filter((property) => ts.isPropertyAssignment(property) && property.name.getText(file) === 'resume')
  assert.equal(properties.length, 1, 'profile needs one resume declaration')
  const resume = properties[0].initializer
  assert.ok(ts.isConditionalExpression(resume) && ts.isIdentifier(resume.condition) && resume.condition.text === '__RESUME_AVAILABLE__', 'Resume descriptor must use the existing availability flag')
  assert.equal(resume.whenFalse.kind, ts.SyntaxKind.NullKeyword, 'Unavailable resume must remain null')
  const descriptor = literal(resume.whenTrue, 'profile.resume')
  assert.equal(descriptor.href, '/resume.pdf', 'Resume must reference the dedicated public PDF')
  assert.ok(typeof descriptor.filename === 'string' && /^[^\\/]+\.pdf$/i.test(descriptor.filename), 'Resume needs a plain PDF download filename')
  return descriptor
}

export function matchingItems(items, lifecycle = 'all', tag = null) {
  assert.ok(Object.hasOwn(statusOptions, lifecycle), `Invalid lifecycle filter ${lifecycle}`)
  return items.filter((item) => (lifecycle === 'all' || item.lifecycle === lifecycle) && (tag === null || item.tags?.includes(tag)))
}

export function assertLifecycleBadges(html, items) {
  const articles = [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map((match) => match[1])
  for (const item of items) {
    const matches = articles.filter((article) => article.includes(`id="title-${item.id}"`))
    assert.equal(matches.length, 1, `${item.id} needs one prerendered card`)
    const badges = [...matches[0].matchAll(/<span\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g)]
      .filter((match) => match[1].split(/\s+/).includes('project-lifecycle'))
    assert.equal(badges.length, 1, `${item.id} needs one lifecycle badge`)
    const states = badges[0][1].split(/\s+/).filter((value) => Object.keys(lifecycleLabels).some((status) => value === `is-${status}`))
    assert.deepEqual(states, [`is-${item.lifecycle}`], `${item.id} badge must match the declared lifecycle`)
    assert.equal(badges[0][2].replace(/<[^>]*>/g, '').trim(), lifecycleLabels[item.lifecycle], `${item.id} needs the literal lifecycle label`)
  }
}

export function assertResumeFilename(attributes, filename) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
  const escaped = filename.replace(/[&<>"']/g, (character) => entities[character])
  assert.equal(attributes.match(/(?:^|\s)download="([^"]+)"/)?.[1], escaped, 'Resume must retain the configured native filename')
}

export function assertResumeIntegrity(source, built) {
  if (source === null) {
    assert.equal(built, null, 'Removed resume must not remain publicly downloadable in dist')
    return { available: false }
  }
  assert.equal(source.subarray(0, 5).toString(), '%PDF-', 'Public resume needs a PDF signature, not an HTML fallback')
  assert.ok(built !== null, 'Approved public resume must be copied into dist')
  assert.deepEqual(built, source, 'Built resume bytes must match the current public PDF, not an older version')
  return { available: true, bytes: source.length, sha256: createHash('sha256').update(source).digest('hex') }
}
async function optionalFile(url) {
  try { return await readFile(url) }
  catch (error) { if (error.code === 'ENOENT') return null; throw error }
}
export async function loadContentContract() {
  const [projectsText, profileText, sourcePdf, builtPdf] = await Promise.all([
    readFile(new URL('src/data/projects.ts', root), 'utf8'),
    readFile(new URL('src/data/profile.ts', root), 'utf8'),
    optionalFile(new URL('public/resume.pdf', root)),
    optionalFile(new URL('dist/resume.pdf', root)),
  ])
  return { ...parseCollections(projectsText), resume: { ...parseResumeDescriptor(profileText), ...assertResumeIntegrity(sourcePdf, builtPdf) } }
}
