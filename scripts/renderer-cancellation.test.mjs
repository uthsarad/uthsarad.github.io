import test from 'node:test'
import assert from 'node:assert/strict'
import { isExpectedRendererAbort } from './renderer-cancellation.mjs'

const url = 'https://uthsarad.github.io/black-hole/noise_texture.png'
const failure = { requestId: 7, url, error: 'net::ERR_ABORTED' }
const proof = {
  requestId: 7, url, phase: 'motion-pause', generation: 'initial',
  signalAborted: true, fetchOutcome: 'AbortError', pauseStartedAt: 100, abortedAt: 101,
}

test('Accepts only a fully proven exact renderer-owned request abort', () => {
  assert.equal(isExpectedRendererAbort(failure, proof), true)
  assert.equal(isExpectedRendererAbort({ ...failure, status: 200 }, proof), true)
  assert.equal(isExpectedRendererAbort(failure, { ...proof, pauseStartedAt: 0, abortedAt: 0 }), true)
  const httpUrl = 'http://127.0.0.1:4173/black-hole/noise_texture.png'
  assert.equal(isExpectedRendererAbort({ ...failure, url: httpUrl }, { ...proof, url: httpUrl }), true)
})

for (const key of Object.keys(failure)) {
  test(`Rejects missing failure.${key}`, () => {
    const incomplete = { ...failure }
    delete incomplete[key]
    assert.equal(isExpectedRendererAbort(incomplete, proof), false)
  })
}
for (const key of Object.keys(proof)) {
  test(`Rejects missing proof.${key}`, () => {
    const incomplete = { ...proof }
    delete incomplete[key]
    assert.equal(isExpectedRendererAbort(failure, incomplete), false)
  })
}

const rejected = [
  ['same URL but another request', { requestId: 8 }, {}],
  ['proof id mismatch', {}, { requestId: 8 }],
  ['proof id string', {}, { requestId: '7' }],
  ['URL mismatch', {}, { url: `${url}?other-request` }],
  ['resumed generation', {}, { generation: 'resumed' }],
  ['wrong phase', {}, { phase: 'teardown' }],
  ['unproven signal', {}, { signalAborted: false }],
  ['truthy signal instead of true', {}, { signalAborted: 'true' }],
  ['outcome mismatch', {}, { fetchOutcome: 'TypeError' }],
  ['abort before pause', {}, { abortedAt: 99 }],
  ['negative pause', {}, { pauseStartedAt: -1 }],
  ['string pause time', {}, { pauseStartedAt: '100' }],
  ['ERR_FAILED', { error: 'net::ERR_FAILED' }, {}],
  ['HTTP 500', { status: 500 }, {}],
  ['HTTP 400 boundary', { status: 400 }, {}],
  ['invalid HTTP status', { status: NaN }, {}],
  ['string HTTP status', { status: '500' }, {}],
]
for (const [name, failureChanges, proofChanges] of rejected) {
  test(`Rejects ${name}`, () => {
    assert.equal(isExpectedRendererAbort({ ...failure, ...failureChanges }, { ...proof, ...proofChanges }), false)
  })
}

for (const requestId of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '7', null]) {
  test(`Rejects invalid matching request ids ${String(requestId)}`, () => {
    assert.equal(isExpectedRendererAbort({ ...failure, requestId }, { ...proof, requestId }), false)
  })
}
for (const key of ['pauseStartedAt', 'abortedAt']) {
  for (const value of [NaN, Infinity, -Infinity, null]) {
    test(`Rejects invalid ${key} ${String(value)}`, () => {
      assert.equal(isExpectedRendererAbort(failure, { ...proof, [key]: value }), false)
    })
  }
}
for (const invalidUrl of [
  'not a URL', '/black-hole/noise_texture.png',
  'https://', 'https://example.com/black-hole/deflection.dat',
  'https://example.com/other/noise_texture.png',
  'https://example.com/black-hole/noise_texture.png/extra',
  'https://example.com/black-hole/NOISE_TEXTURE.png',
  'ftp://example.com/black-hole/noise_texture.png',
  'file:///black-hole/noise_texture.png', 'javascript:alert(1)', null,
]) {
  test(`Rejects malformed, relative, wrong-path or wrong-scheme URL ${String(invalidUrl)}`, () => {
    assert.equal(isExpectedRendererAbort({ ...failure, url: invalidUrl }, { ...proof, url: invalidUrl }), false)
  })
}
for (const invalid of [undefined, null, false, 7, 'proof']) {
  test(`Rejects invalid input ${String(invalid)}`, () => {
    assert.equal(isExpectedRendererAbort(invalid, proof), false)
    assert.equal(isExpectedRendererAbort(failure, invalid), false)
  })
}

test('Classification does not mutate failure or proof evidence', () => {
  assert.equal(isExpectedRendererAbort(Object.freeze({ ...failure }), Object.freeze({ ...proof })), true)
})
