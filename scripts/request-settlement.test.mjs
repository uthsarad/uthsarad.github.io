import test from 'node:test'
import assert from 'node:assert/strict'
import { settleTrackedRequests } from './request-settlement.mjs'

// These small in-memory ledgers are harness tests, not browser/application evidence.
const options = { quietMs: 20, timeoutMs: 500, pollMs: 2 }

test('An empty ledger still requires an observed quiet interval', async () => {
  const activity = Date.now()
  const result = await settleTrackedRequests(new Map(), () => activity, options)
  assert.equal(result.pendingCount, 0)
  assert.ok(Date.now() - activity >= options.quietMs)
})
test('A pending favicon must finish and then remain quiet, not be ignored', async () => {
  const request = { url: 'http://127.0.0.1:4173/favicon.svg?v=2', resourceType: 'other' }
  const pending = new Map([[request, request]])
  let activity = Date.now()
  let finishedAt
  const timer = setTimeout(() => { pending.delete(request); activity = finishedAt = Date.now() }, 10)
  try {
    const result = await settleTrackedRequests(pending, () => activity, options)
    assert.equal(result.pendingCount, 0)
    assert.ok(finishedAt && Date.now() - finishedAt >= options.quietMs)
  } finally { clearTimeout(timer) }
})
test('A request arriving during the quiet window resets settlement', async () => {
  const pending = new Map()
  const request = { url: 'http://127.0.0.1:4173/late-icon.svg' }
  let activity = Date.now()
  let finishedAt
  const start = setTimeout(() => { pending.set(request, request); activity = Date.now() }, 5)
  const finish = setTimeout(() => { pending.delete(request); activity = finishedAt = Date.now() }, 12)
  try {
    await settleTrackedRequests(pending, () => activity, options)
    assert.ok(finishedAt && Date.now() - finishedAt >= options.quietMs)
  } finally { clearTimeout(start); clearTimeout(finish) }
})
test('An unresolved request fails at the deadline with its identity preserved', async () => {
  const request = { url: 'http://127.0.0.1:4173/favicon.svg?v=2', requestId: 11 }
  const pending = new Map([[request, request]])
  await assert.rejects(settleTrackedRequests(pending, () => 0, { ...options, timeoutMs: 12 }), /deadline.*favicon\.svg/)
  assert.equal(pending.size, 1)
  assert.equal(pending.get(request), request)
})
test('Invalid settlement timing fails rather than weakening the barrier', async () => {
  for (const key of ['quietMs', 'timeoutMs', 'pollMs']) {
    await assert.rejects(settleTrackedRequests(new Map(), () => 0, { ...options, [key]: 0 }), /positive integer/)
  }
})
